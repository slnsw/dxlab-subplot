# -*- coding: utf-8 -*-
"""Module with logic to load raw SLNSW data into MongoDB."""

import os
import csv
import json

from logzero import logger

from app.tools.mongo_loader import MongoLoader
from app.settings import settings


class SLNSWSubdivisionsCSVLoader(MongoLoader):
    """Data provided by Geoff.

    Subdivision data from SLNSW records. Contain titles,
    links to zoomify and SLNSW records.
    
    NOTE: This data is not included in the final subdivision export
    because most of the link ends in redirect page in the SLNSW collection.    
    """

    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw_subdivisions'

    filepath = './data/SLNSW/SLNSW_Subdivision_maps_Klokan_Schema_20170207.csv'

    def walk_csv(self, filepath: str):
        """Generator of data rows of the given csv file."""
        with open(filepath, encoding='ISO-8859-1') as f:
            reader = csv.DictReader(f)
            for row in reader:
                logger.debug('Loading row {}'.format(row.get(self.reference_field, None)))
                yield row

    def load_objects(self, *args, **kwargs):
        return self.walk_csv(self.filepath)


class SLNSWLinkTitles(MongoLoader):
    """Data provided by Luke. 
    
    Titles and Links from SLNSW collection of the ingested Klokan records.

    NOTE: reconciliated via asset_id found in Klokan.
    """

    reference_field = 'asset_id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw_link_title'

    filepath = './data/SLNSW/SLNSW_subdivision_titles_links_20201105.json'

    def walk_json(self, filepath: str):
        """Generator of data rows of the given csv file."""
        with open(filepath, encoding='ISO-8859-1') as f:
            data = json.load(f)
            for row in data:
                logger.debug('Loading row {}'.format(row.get(self.reference_field, None)))
                yield row

    def load_objects(self, *args, **kwargs):
        return self.walk_json(self.filepath)
