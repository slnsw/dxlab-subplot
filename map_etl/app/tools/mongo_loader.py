# -*- coding: utf-8 -*-
"""MonogoDB data loader implementation."""

from typing import Iterable
from pymongo import IndexModel
from logzero import logger
from pydash import py_

from app.settings import settings
from app.tools.data_storage import MongoConnection
from app.tools.data_loader import BaseLoader


class MongoLoader(BaseLoader):
    """Store loaded data into a MongoDB colleciton."""

    database = None
    collection = None
    reference_field = None

    def conf(self):
        # TODO: Yes this should be a parameter
        connection = MongoConnection(settings.MONGO_URI)
        self.client = connection.client
        self.collection = self.client[self.database][self.collection]
        self.collection.create_indexes([IndexModel([(self.reference_field, 1)])])

    def save(self, row):
        # lookup = py_.pick(row, self.reference_field)
        lookup = {}
        lookup[self.reference_field] = py_.get(row, self.reference_field)

        row.pop('_id', None)
        self.collection.update_one(lookup, {'$set': row}, upsert=True)

    def get_collection(self, collection: str = None, database: str = None):
        database = database or self.database
        collection = collection or self.collection
        if collection and database:
            return self.client[database][collection]
        else:
            raise Exception('Missing database or collection configuration')
        return

    def queryset(self, collection: str = None, database: str = None, query={}) -> Iterable:
        """Helper function to load data from teh configured or any given collection."""
        mongo = self.get_collection(collection, database)
        qs = mongo.find(query)
        for doc in qs:
            yield doc