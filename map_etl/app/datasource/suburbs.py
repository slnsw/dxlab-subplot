# -*- coding: utf-8 -*-
"""Module with logic to load raw NSW suburds list."""

import os
import csv

from logzero import logger

from geojson import Point, Polygon
from pymongo import IndexModel, GEOSPHERE

from app.tools.mongo_loader import MongoLoader
from app.settings import settings


class NSWSuburbsCSVLoader(MongoLoader):
    """Data provided found online at https://gist.github.com/randomecho/5020859."""

    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_nsw_suburbs'

    filepath = './data/NSW_suburbs/NSW_suburbs_2019.csv'

    def conf(self):
        super().conf()

        geo_index_fields = ['geo_location']
        for inx_field in geo_index_fields:
            self.collection.create_indexes([IndexModel([(inx_field, GEOSPHERE)])])

    def walk_csv(self, filepath: str):
        """Generator of data rows of the given csv file."""
        with open(filepath, encoding='ISO-8859-1') as f:
            reader = csv.DictReader(f)
            for row in reader:
                logger.debug('Loading row {}'.format(row.get('id', None)))
                yield row

    def load_objects(self, *args, **kwargs):
        return self.walk_csv(self.filepath)

    def parse(self, obj):
        try:
            geo_fields = ['longitude', 'latitude']
            geo_values = [float(obj.get(f)) for f in geo_fields]
            point = Point(geo_values)
            if point.is_valid:
                obj['geo_location'] = point
        except:
            pass

        return obj
