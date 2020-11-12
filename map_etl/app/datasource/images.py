# -*- coding: utf-8 -*-
"""Module with logic to load raw NSWL data into MongoDB."""

import glob
import imagehash
import numpy
import io
import cv2
import os

from pathlib import Path

from typing import List, Tuple, Dict, Callable
from collections import OrderedDict
from pathlib import Path
from logzero import logger

from PIL import Image, ImageDraw
from sklearn import cluster
from pydash import py_

from app.tools.mongo_loader import MongoLoader
from app.settings import settings

from .klokan import KlokanHiddenDataLoader

import PIL
PIL.Image.MAX_IMAGE_PIXELS = None


class BaseComasterLoader(object):
    reference_field = 'asset_id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw_comaster'


class ComasterImagesLoader(BaseComasterLoader, MongoLoader):
    """Process comaster images."""

    # Path where commaster images are stored
    folderpath = settings.SLNSW_COMASTERS_PATH

    def walk_folder(self, folderpath: str):
        """Generator of data rows of the given csv file."""
        for image_path in Path(folderpath).glob('**/*'):  # glob.glob(folderpath + "/*.tif"):
            if image_path.suffix in ('.tif', '.jpg'):
                yield image_path

    def image_hash(self, filepath: str) -> str:
        image = Image.open(filepath)
        h = str(imagehash.phash(image))
        return h

    def quantize(self, raster, n_colors):
        width, height, depth = raster.shape
        reshaped_raster = numpy.reshape(raster, (width * height, depth))

        model = cluster.KMeans(n_clusters=n_colors)
        model.fit(reshaped_raster)
        labels = model.predict(reshaped_raster)
        # labels = model.fit_predict(reshaped_raster)
        palette = model.cluster_centers_

        quantized_raster = numpy.reshape(palette[labels], (width, height, palette.shape[1]))

        return quantized_raster

    def is_colored(self, filepath: str) -> tuple:
        """Base on https://www.pyimagesearch.com/2017/06/05/computing-image-colorfulness-with-opencv-and-python/"""

        image = cv2.imread(filepath)

        # Reduce noise image
        image = cv2.GaussianBlur(image, (5, 5), 0)

        # split the image into its respective RGB components
        (B, G, R) = cv2.split(image.astype("float"))

        # compute rg = R - G
        rg = numpy.absolute(R - G)

        # compute yb = 0.5 * (R + G) - B
        yb = numpy.absolute(0.5 * (R + G) - B)

        # compute the mean and standard deviation of both `rg` and `yb`
        (rbMean, rbStd) = (numpy.mean(rg), numpy.std(rg))
        (ybMean, ybStd) = (numpy.mean(yb), numpy.std(yb))

        # combine the mean and standard deviations
        stdRoot = numpy.sqrt((rbStd**2) + (ybStd**2))
        meanRoot = numpy.sqrt((rbMean**2) + (ybMean**2))

        # derive the "colorfulness" metric and return it
        colorfulness = stdRoot + (0.3 * meanRoot)
        has_color = round(float(colorfulness), 2) >= 19.73

        return has_color, colorfulness

    def load_objects(self, *args, **kwargs):

        for i, path in enumerate(self.walk_folder(self.folderpath)):
            path_info = Path(path)
            asset_id = path_info.name.replace(path_info.suffix, '')

            query = {'asset_id': asset_id, 'processed': True}
            if self.collection.find(query).count(True) == 0:
                # Processing
                logger.debug('{} - {}'.format(i, asset_id))

                colored, colorfulness = (False, 0)
                hash_img = None
                processed = False
                error = ''

                try:
                    colored, colorfulness = self.is_colored(str(path))
                    hash_img = self.image_hash(path)
                    processed = True
                except Exception as e:
                    error = str(e)

                yield {
                    'asset_id': asset_id,
                    'hash': hash_img,
                    'filename': path_info.name,
                    'colored': colored,
                    'colorfulness': colorfulness,
                    'processed': processed,
                    'error': error
                }

            else:
                logger.debug('skip {} - {}'.format(i, asset_id))


class ComasterDuplicateImageLoader(BaseComasterLoader, MongoLoader):

    THRESHOLD_SIMILARITY = 7

    def hamming_distance(self, s1, s2):
        assert len(s1) == len(s2)
        return sum(ch1 != ch2 for ch1, ch2 in zip(s1, s2))

    # Quick dirty way not memory efficient
    def load_image_hash_index(self):
        index = OrderedDict()
        mongo = self.get_collection(ComasterImagesLoader.collection, self.database)
        # query = {'asset_id': {'$in': ['a1358043', 'a1358044', 'a1358045', 'a1358047']}}
        query = {}
        qs = mongo.find(query)
        qs = qs.sort('hash', -1)
        for doc in qs:
            index[doc['hash']] = doc['asset_id']

        return index

    def find_similar(self, index: OrderedDict):
        for i, row in enumerate(index.items()):
            h, asset_id = row
            logger.info('Finding similar images of {}'.format(asset_id))

            similar = []
            data = {'asset_id': asset_id, 'similar': similar}
            for target, target_asset in index.items():
                try:
                    distance = self.hamming_distance(h, target)
                    if distance <= self.THRESHOLD_SIMILARITY and target_asset != asset_id:
                        logger.debug('{} -  similar {} -> {} : {}'.format(i, asset_id, target_asset, distance))
                        similar.append({'asset_id': target_asset, 'distance': distance})
                except:
                    logger.debug('{} hash is None'.format(asset_id))
                    pass

            data['similar_count'] = len(similar)

            yield data

    def load_objects(self, *args, **kwargs):
        index = self.load_image_hash_index()
        for doc in self.find_similar(index):
            yield doc


class ComasterImageProcessLoader(BaseComasterLoader, MongoLoader):
    """Crop comaster images using cutline."""

    def get_cutline(self, asset_id: str) -> List[int]:
        cutline = None

        # 1. Get Koklan pixels cut line
        mongo = self.get_collection(KlokanHiddenDataLoader.collection)
        klokan_doc = mongo.find_one({'id': asset_id}, {'cutline': 1})

        if klokan_doc:
            cutline = klokan_doc['cutline']

        return cutline

    def crop_image(self, filename: str = None, asset_id: str = None, **doc: dict) -> bool:
        success = False

        src_exists, src_path = self._path(filename=filename)
        out_exists, out_path = self._path(asset_id, 'crop')

        cutline = self.get_cutline(asset_id)
        if cutline:
            if src_exists and not out_exists:
                with open(src_path, 'rb') as f:
                    logger.debug('cropping {}'.format(asset_id))
                    im = Image.open(io.BytesIO(f.read()))

                    # convert to numpy (for convenience)
                    imArray = numpy.asarray(im)

                    # create mask
                    maskIm = Image.new('L', (imArray.shape[1], imArray.shape[0]), 0)
                    cutline = [tuple(c) for c in cutline]
                    ImageDraw.Draw(maskIm).polygon(cutline, outline=1, fill=1)
                    mask = numpy.array(maskIm)

                    # assemble new image (uint8: 0-255)
                    newImArray = numpy.empty(imArray.shape, dtype='uint8')

                    # colors (three first columns, RGB)
                    newImArray[:, :, :3] = imArray[:, :, :3]

                    # transparency (4th column)
                    newImArray = numpy.dstack((newImArray, mask * 255))

                    # back to Image from numpy
                    newIm = Image.fromarray(newImArray, "RGBA")
                    newIm.save(out_path)

            else:
                logger.debug('Crop for {} exists already'.format(asset_id))

            success = True

        return success

    def _path(self, asset_id: str = None, suffix: str = None, ext: str = 'png',
              filename: str = None) -> Tuple[bool, str]:

        if filename is None:
            if asset_id and suffix and ext:
                path = '{}/{}_{}.{}'.format(ComasterImagesLoader.folderpath, asset_id, suffix, ext)

            elif asset_id and ext and not suffix:
                path = '{}/{}.{}'.format(ComasterImagesLoader.folderpath, asset_id, ext)

        else:
            path = '{}/{}'.format(ComasterImagesLoader.folderpath, filename)

        path = os.path.abspath(path)

        return Path(path).is_file(), path

    def derivative_cutline_crop(self, asset_id: str = None, size: int = 800, **doc: dict) -> bool:
        success = False

        src_exists, src_path = self._path(asset_id, 'crop')
        out_exists, out_path = self._path(asset_id, 'crop_{}'.format(size))

        if not out_exists and src_exists:
            try:
                im = Image.open(src_path)
                im.thumbnail((size, size), Image.ANTIALIAS)
                im.save(out_path, "png")
                success = True
            except IOError:
                logger.debug('Can\'t create derivative for {} with size {}'.format(asset_id, size))

        if success:
            logger.debug('Derivative {} for {} created'.format(asset_id, size))
        else:
            logger.debug('Derivative {} for {} already exists'.format(asset_id, size))

        return success

    def derivative_uncrop(self, asset_id: str = None, size: int = None, **doc: dict) -> bool:
        success = False

        src_exists, src_path = self._path(asset_id, 'uncrop')

        if size:
            out_exists, out_path = self._path(asset_id, 'uncrop_{}'.format(size))
        else:
            out_exists, out_path = src_exists, src_path

        if src_exists:
            if not out_exists:
                try:
                    im = Image.open(src_path)
                    im.thumbnail((size, size), Image.ANTIALIAS)
                    im.save(out_path, "png")
                    success = True
                except IOError:
                    logger.debug('Can\'t create uncrop for {} with size {}'.format(asset_id, size))

                if success:
                    logger.debug('Derivative {} for {} created'.format(asset_id, size))
                else:
                    logger.debug('Derivative {} for {} already exists'.format(asset_id, size))
        else:
            logger.debug('Derivative {}: source {} not found'.format(asset_id, src_path))

        return success

    def process_thumbnail(self, *, image: Image, size: int, asset_id: str, ext: str = 'png') -> Image:

        if image:
            try:
                im = image.copy()
                im.thumbnail((size, size), Image.ANTIALIAS)
                return im
            except IOError:
                raise Exception('Can\'t create thumbnail for {} with size {}'.format(asset_id, size))

    def derivatives(
        self,
        *,
        filename: str,
        asset_id: str,
        suffix: str,
        process: Callable,
        sizes: List[int] = [],
        ext: str = 'png',
        **kwargs: dict
    ) -> Dict[str, bool]:

        src_exists, src_path = self._path(filename=filename)
        if not src_exists:
            raise Exception('{} source not found {}'.format(asset_id, src_path))

        with open(src_path, 'rb') as f:
            image = Image.open(io.BytesIO(f.read()))

            for size in sizes:
                out_exists, out_path = self._path(asset_id, suffix=f'{suffix}_{size}')
                if not out_exists:
                    logger.debug(f'creating derivative {asset_id}_{suffix}_{size}')
                    try:
                        im = process(image=image, size=size, asset_id=asset_id, ext=ext)
                        im.save(out_path, ext)
                    except Exception as e:
                        logger.debug(f'Fail {asset_id}_{suffix}_{size} with {e}')
                else:
                    logger.debug(f'derivative {asset_id}_{suffix}_{size} already exists')

    def derivate_edge_detection(self, asset_id: str = None, size: int = None, **doc: dict):
        success = False

        suffix = 'edge_{}'.format(size) if size is not None else 'edge'

        src_exists, src_path = self._path(asset_id, 'crop')
        out_exists, out_path = self._path(asset_id, suffix=suffix)

        if not out_exists and src_exists:
            # sigma = 0.33
            sigma = 1

            logger.debug('Edge {}'.format(asset_id))
            src = cv2.imread(src_path, cv2.IMREAD_UNCHANGED)

            bgr = src[:, :, :3]  # Channels 0..2
            im = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
            im = cv2.GaussianBlur(im, (3, 3), 0)

            # convert to numpy (for convenience)
            im = numpy.asarray(im)

            # compute the median of the single channel pixel intensities
            v = numpy.median(im)

            # apply automatic Canny edge detection using the computed median
            lower = int(max(0, (1.0 - sigma) * v))
            upper = int(min(255, (1.0 + sigma) * v))
            im = cv2.Canny(im, lower, upper)

            im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
            alpha = src[:, :, 3]  # Channel 3
            im = numpy.dstack([im, alpha])  # Add the alpha channel

            # resize
            if size:
                # Resizing using Pillow get better result not sure why
                im = Image.fromarray(im)
                im.thumbnail((size, size), Image.ANTIALIAS)
                im.save(out_path, "png")
            else:
                cv2.imwrite(out_path, im)
            success = True

        if success:
            logger.debug('Derivative edge {} created'.format(asset_id))
        else:
            logger.debug('Derivative edge {} already exists'.format(asset_id))

        return success

    def get_image_info(self, asset_id: str = None, **doc: dict) -> dict:
        success = False
        info = {}

        src_exists, src_path = self._path(asset_id, ext='tif')

        if src_exists:
            try:
                im = Image.open(src_path)
                width, height = im.size
                info.update({'width': width, 'height': height})

                success = True
            except IOError:
                logger.debug('Can\'t read image for {}'.format(asset_id))

        if success:
            logger.debug('Get image info of {}'.format(asset_id))
        else:
            logger.debug('Can\'t get info of {}'.format(asset_id))

        return info

    def load_objects(self, *args, **kwargs):
        qs = self.queryset(ComasterImagesLoader.collection)
        for i, doc in enumerate(qs):
            try:
                logger.debug('{} - {asset_id}'.format(i, **doc))
                # Create cutline crop
                doc['has_cutline_crop'] = self.crop_image(**doc)

                sizes = [8, 16, 32, 64, 128, 256, 512, 1024]

                params = py_.pick(doc, ['filename', 'asset_id'])
                self.derivatives(suffix='uncrop', process=self.process_thumbnail, sizes=sizes, **params)

                params.update({'filename': '{asset_id}_crop.png'.format(**doc)})
                self.derivatives(suffix='crop', process=self.process_thumbnail, sizes=sizes, **params)

                # # Create derivative of the crop
                # self.derivative_cutline_crop(size=800, **doc)
                # self.derivative_cutline_crop(size=1600, **doc)

                # # Edge derivative
                # self.derivate_edge_detection(**doc)
                # self.derivate_edge_detection(**doc, size=800)
                # self.derivate_edge_detection(**doc, size=1600)

                # # Create uncrop derivatives
                # self.derivative_uncrop(size=800, **doc)
                # self.derivative_uncrop(size=1600, **doc)

                doc.update(self.get_image_info(**doc))

                yield doc
            except Exception as e:
                logger.exception(f'Fail croping images: {e}')
