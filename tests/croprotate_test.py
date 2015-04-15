import shutil

from pathlib import Path
from jpegtran import JPEGImage

import spreadsplug.croprotate as croprotate
from spreads.workflow import Page


# TODO: Test if latest processed_image is cropped and rotated if present
# TODO: Test if jpegtran/wand switch is sucessful


def test_process(tmpdir):
    # No need for confit.Configuration, since the plugin doesn't have any
    # configuration
    config = {'croprotate': None}
    pages = {}
    target_path = Path(unicode(tmpdir.join("out")))
    target_path.mkdir()
    for idx in xrange(4):
        in_path = Path(unicode(tmpdir.join("{0:03}.jpg".format(idx))))
        shutil.copyfile('./tests/data/odd.jpg', unicode(in_path))
        in_page = Page(in_path, None,
                       processing_params={'rotate': idx*90,
                                          'crop': (0, 0, 100, 200)})
        out_path = target_path/"{0:03}_croprotate.jpg".format(idx)
        pages[in_page] = out_path

    plugin = croprotate.CropRotatePlugin(config)
    plugin.process(pages.keys(), target_path)

    for in_page, out_path in pages.iteritems():
        assert out_path.exists()
        out_img = JPEGImage(unicode(out_path))
        if in_page.processing_params['rotate'] in (90, 270):
            assert out_img.width == 200
            assert out_img.height == 100
        else:
            assert out_img.width == 100
            assert out_img.height == 200
