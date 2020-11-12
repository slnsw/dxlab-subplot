# -*- coding: utf-8 -*-


from pymongo import MongoClient

class MongoConnection(object):

    _shared_state = {}

    def __init__(self, uri:str):
        self.__dict__ = self._shared_state
        self.uri = uri

    
    @property
    def client(self):
        key = 'client_{}'.format(self.uri)
        client = self._shared_state.get(key, None)
        if client is None:
            client = MongoClient(self.uri)
            self._shared_state[key]=client
    
        return client