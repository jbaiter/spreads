# -*- coding: utf-8 -*-

# Copyright (C) 2014 Johannes Baiter <johannes.baiter@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# -*- coding: utf-8 -*-

""" Postprocessing plugin that crops and rotates images according to their
    page's postprocessing parameters.
"""

from __future__ import unicode_literals

import logging

from concurrent.futures import ProcessPoolExecutor
try:
    from jpegtran import JPEGImage
    HAS_JPEGTRAN = True
except ImportError:
    HAS_JPEGTRAN = False
    from PIL import Image

from spreads.plugin import HookPlugin, ProcessHooksMixin

logger = logging.getLogger('spreadsplug.croprotate')


def transform_image(in_path, out_path, cropbox, angle):
    """ Crop and rotate an image.

    :param in_path:     Path to image that should be rotated
    :type in_path:      unicode
    :param out_path:    Path where rotated image should be written to
    :type out_path:     unicode
    :param cropbox:     A 4-tuple of (x, y, width, height) that defines
                        the area to be cropped, as floating point values
                        relative to the uncropped image.
    :type cropbox:      4-tuple of int
    :param angle:       Angle to rotate by, a multiple of 90
    :type angle:        int
    """
    if angle % 90:
        raise ValueError("'angle' must be a multiple of 90 (was: {})"
                         .format(angle))
    if cropbox and len(cropbox) != 4:
        raise ValueError(
            "'cropbox' must be a 4-tuple of (x, y, width, height)")
    # We provide two implementations, one with the fast
    # :py:module:`jpegtran` library and one with :py:module:`wand.image`,
    # that is also compatible with Windows systems
    if HAS_JPEGTRAN and in_path[-4:] in ('.jpg', '.jpeg'):
        img = JPEGImage(in_path)
        if cropbox:
            # TODO: Round parameters to the nearest value that is a multiple
            #       of 16.
            x, y, width, height = cropbox
            logger.debug("Cropping \"{0}\" to x:{1} y:{2} w:{3} h:{4}"
                         .format(in_path, x, y, width, height))
            cropped = img.crop(x, y, width, height)
        else:
            cropped = img
        if angle > 0:
            rotated = cropped.rotate(angle)
        else:
            rotated = cropped
        rotated.save(out_path)
    else:
        with Image(filename=in_path) as img:
            if cropbox:
                x, y, width, height = cropbox
                logger.debug("Cropping \"{0}\" to x:{1} y:{2} w:{3} h:{4}"
                             .format(in_path, x, y, width, height))
                img.crop(x, y, x + width, y + height)
            if angle > 0:
                img.rotate(angle)
            img.save(filename=out_path)


class CropRotatePlugin(HookPlugin, ProcessHooksMixin):
    __name__ = 'croprotate'

    def _get_progress_callback(self, idx, num_total):
        """ Get a callback that sends out a :py:attr:`on_progressed` signal.

        :param idx:         Index of processed image
        :type idx:          int
        :param num_total:   Total number of images to be processed.
        :type num_total:    int
        :returns:           A callback that sends out the signal with the
                            passed values.
        :rtype:             function
        """
        return lambda x: self.on_progressed.send(
            self,
            progress=float(idx)/num_total)

    def _get_update_callback(self, page, out_path):
        """ Get a callback that updates the list of processed images for a page

        :param page:        Page for which the
                            :py:attr:`spreads.workflow.Page.processed_images`
                            mapping should be updated
        :type page:         :py:class:`spreads.workflow.Page`
        :param out_path:    Path where the rotated image is located
        :type out_path:     :py:class:`pathlib.Path`
        """
        return lambda x: page.processed_images.update(
            {self.__name__: out_path})

    def process(self, pages, target_path):
        """ For each page, crop and rotate the most recent image according to
            the page's postprocessing parameters.

        :param pages:       Pages to be processed
        :type pages:        list of :py:class:`spreads.workflow.Page`
        :param target_path: Base directory where rotated images are to be
                            stored
        :type target_path:  :py:class:`pathlib.Path`
        """
        logger.info("Cropping and rotating images")
        futures = []
        # Distribute the work across all processor cores
        with ProcessPoolExecutor() as executor:
            num_total = len(pages)
            for (idx, page) in enumerate(pages):
                if self.__name__ in page.processed_images:
                    logger.info(
                        "Image was previously cropped and rotated already, "
                        "skipping.")
                    continue
                in_path = page.get_latest_processed(image_only=True)
                if in_path is None:
                    in_path = page.raw_image
                out_path = target_path/(in_path.stem + "_croprotate.jpg")
                logger.debug("{0} => {1}".format(in_path, out_path))
                future = executor.submit(
                    transform_image,
                    unicode(in_path),
                    unicode(out_path),
                    page.processing_params['crop'],
                    page.processing_params['rotate'])
                future.add_done_callback(
                    self._get_progress_callback(idx, num_total)
                )
                future.add_done_callback(
                    self._get_update_callback(page, out_path)
                )
                futures.append(future)
        for fut in futures:
            try:
                fut.result()
            except Exception as e:
                raise e
