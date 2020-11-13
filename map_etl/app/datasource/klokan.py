# -*- coding: utf-8 -*-
"""Module with logic to load raw Klokan data into MongoDB."""

import os
import csv
import json
import requests

from logzero import logger

from pyquery import PyQuery as pq
from pydash import py_
from toolz.functoolz import memoize

from app.tools.mongo_loader import MongoLoader
from app.settings import settings


class KlokanGoogleCSVLoader(MongoLoader):

    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_klokan'

    filepath = './data/klokan/georeferencer_nsw.csv'

    def walk_csv(self, filepath: str):
        """Generator of data rows of the given csv file."""
        with open(filepath, encoding='ISO-8859-1') as f:
            reader = csv.DictReader(f)
            for row in reader:
                logger.debug('Loading map {}'.format(row.get('id', None)))
                yield row

    def load_objects(self, *args, **kwargs):
        return self.walk_csv(self.filepath)

    def parse(self, row):
        del row['envelope']
        return row


class KlokanHiddenDataLoader(MongoLoader):
    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_klokan_hidden'

    def get_georeference_data(self, id: str) -> dict:
        url = '{}/{}/visualize'.format(settings.SLNSW_GEOREFERENCER_URL, id)
        logger.debug('Getting hidden data from: {}'.format(url))

        d = pq(url=url)
        info_str = d('script')[2].text

        # clean up
        info_str = info_str.replace('var georef = ', '')
        info_str = info_str.replace(';', '')

        # Load JSON data
        info = json.loads(info_str)
        return info

    def load_objects(self, *args, **kwargs):
        qs = self.queryset(KlokanGoogleCSVLoader.collection, {})
        for doc in qs:
            id = doc['georeferencer_id']
            data = self.get_georeference_data(id)
            data['id'] = doc['id']

            yield data


class KlokanGeoreferenceFilesLoader(MongoLoader):
    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_klokan_assoc_files'
    download_to = './data/klokan/files'

    @memoize
    def load_page(self, georeferencer_id: str) -> pq:
        url = '{}/{}'.format(settings.SLNSW_GEOREFERENCER_URL, georeferencer_id)
        logger.debug('Loading {}'.format(url))
        return pq(url=url)

    def download_file(self, slnsw_id: str, georeferencer_id: str, ext: str) -> str:
        url = '{}/{}.{}'.format(settings.SLNSW_GEOREFERENCER_URL, georeferencer_id, ext)
        new_filename = '{}.{}'.format(slnsw_id, ext)
        r = requests.get(url, allow_redirects=True)
        to_path = os.path.join(self.download_to, new_filename)
        open(to_path, 'wb').write(r.content)

        return new_filename

    def get_ESRI_metadata(self, georeferencer_id: str) -> dict:
        d = self.load_page(georeferencer_id)
        data = {'width': py_.get(d('#wld-width'), '0.value', '0'), 'height': py_.get(d('#wld-height'), '0.value', '0')}
        return data

    def get_thumbnail(self, slnsw_id: str, georeferencer_id: str) -> dict:
        d = self.load_page(georeferencer_id)
        try:
            url = d('.mymaps-content-left-thumb > a > img').attr['src']
            if url.startswith('//'):
                url = url.replace('//', 'http://', 1)

            new_filename = '{}.{}'.format(slnsw_id, 'jpg')

            r = requests.get(url, allow_redirects=True)
            to_path = os.path.join(self.download_to, new_filename)
            open(to_path, 'wb').write(r.content)

            return {'filename': new_filename, 'url': url}
        except Exception as e:
            logger.exception('Thumbnail failed')
            return {}

    def load_objects(self, *args, **kwargs):
        qs = self.queryset(KlokanGoogleCSVLoader.collection, {})
        for doc in qs:
            slnsw_id = doc['id']
            georeferencer_id = doc['georeferencer_id']

            logger.debug('Downloading wld, kmz and thumbanil of {}'.format(slnsw_id))

            data = {
                'id': slnsw_id,
                # http://webhelp.esri.com/arcims/9.3/General/topics/author_world_files.htm
                'ESRI_world': {
                    'filename': self.download_file(slnsw_id, georeferencer_id, 'wld'),
                    'metadata': self.get_ESRI_metadata(georeferencer_id)
                },
                'OGC_KML': {
                    'filename': self.download_file(slnsw_id, georeferencer_id, 'kmz'),
                },
                'thumbnail': self.get_thumbnail(slnsw_id, georeferencer_id)
            }

            yield data


class KlokanWorldFileLoader(MongoLoader):
    """Load word file into a dictionary and store it in a Mongo collection."""
    reference_field = 'asset_id'
    database = settings.MONGO_DATABASE
    collection = 'raw_klokan_world_files'
    klokan_files = './data/klokan/files'

    def load_wld_file(self, asset_id) -> dict:
        filepath = '{}/{}.wld'.format(self.klokan_files, asset_id)

        data = {}
        # World file coordinates. Futher information at
        # http://webhelp.esri.com/arcims/9.3/General/topics/author_world_files.htm
        keys = ['A', 'D', 'B', 'E', 'C', 'F']
        with open(filepath) as f:
            data['raw'] = f.read()
            f.seek(0)
            if '404 Not Found' not in data['raw']:
                for k, line in enumerate(f):
                    line = line.replace('\n', '')
                    data[keys[k]] = line
            else:
                raise Exception('World file for {} is a 404 error'.format(asset_id))

        return data

    def load_objects(self, *args, **kwargs):
        qs = self.queryset(KlokanGoogleCSVLoader.collection, {})

        for doc in qs:
            slnsw_id = doc['id']

            try:
                wld = self.load_wld_file(slnsw_id)
                wld['asset_id'] = slnsw_id

                yield wld
            except Exception as e:
                print(str(e))
