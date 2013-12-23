# -*- coding: utf-8 -*-

from __future__ import division, unicode_literals

import logging
import os
import subprocess

from spreads.plugin import HookPlugin
from spreads.util import MissingDependencyException, find_in_path

if not find_in_path('djvubind'):
    raise MissingDependencyException("Could not find executable `djvubind` in"
                                     " $PATH. Please install the appropriate"
                                     " package(s)!")

logger = logging.getLogger('spreadsplug.djvubind')


class DjvuBindPlugin(HookPlugin):
    __name__ = 'djvubind'

    def output(self, path):
        logger.info("Assembling DJVU.")
        img_dir = path / 'done'
        djvu_file = path / 'out' / "{0}.djvu".format(path.name)
        cmd = ["djvubind", unicode(img_dir)]
        # TODO: Do this via a check for *.html in 'done'-path
        if self.config['ocr'].get(unicode) == 'none':
            cmd.append("--no-ocr")
        logger.debug("Running " + " ".join(cmd))
        _ = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
        os.rename("book.djvu", djvu_file)
