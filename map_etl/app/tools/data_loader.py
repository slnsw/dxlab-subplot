# -*- coding: utf-8 -*-

import abc
from logging import getLogger
from typing import Iterable

from pymongo import MongoClient

logger = getLogger()


class BaseLoader(object):
    @abc.abstractmethod
    def load_objects(self, *args, **kwargs) -> Iterable:
        pass

    @abc.abstractmethod
    def save(self, obj, *args, **kwargs):
        pass

    def conf(self):
        pass

    def parse(self, obj):
        return obj

    def execute(self):
        self.conf()
        objects = self.load_objects()
        for obj in objects:
            try:
                obj = self.parse(obj)
                self.save(obj)
            except Exception:
                logger.exception('Fail loading obj {}'.format(obj))