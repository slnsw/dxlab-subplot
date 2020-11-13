# -*- coding: utf-8 -*-
"""Main application settings module."""

from environs import Env

env = Env()
env.read_env()  # read .env file, if it exists


class Settings(object):

    MONGO_URI = env('MONGO_URI', 'mongodb://localhost:27017')
    MONGO_DATABASE = 'DXmaps'

    # Georeferencer
    SLNSW_GEOREFERENCER_URL = 'http://nsw.georeferencer.com/map'

    # COMMASTER IMAGES MAINLY TIF FILES
    SLNSW_COMASTERS_PATH = env('SLNSW_COMASTERS_PATH', './data/SLNSW/comaster')

    # Use for crawling the crawler
    GOOGLE_API_KEY = env('GOOGLE_API_KEY')


settings = Settings()
