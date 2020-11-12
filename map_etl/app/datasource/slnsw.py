# -*- coding: utf-8 -*-
"""Module with logic to load raw NSWL data into MongoDB."""

import os
import csv

from logzero import logger

from app.tools.mongo_loader import MongoLoader
from app.settings import settings


class SLNWSCSVLoader(MongoLoader):
    """Data provided by Geoff."""

    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw'

    filepath = './data/SLNSW/SLNSW_Subdivision_maps_Klokan_Schema_20170207.csv'

    def walk_csv(self, filepath: str):
        """Generator of data rows of the given csv file."""
        with open(filepath, encoding='ISO-8859-1') as f:
            reader = csv.DictReader(f)
            for row in reader:
                logger.debug('Loading row {}'.format(row.get('id', None)))
                yield row

    def load_objects(self, *args, **kwargs):
        return self.walk_csv(self.filepath)
