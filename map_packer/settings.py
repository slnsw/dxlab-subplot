# -*- coding: utf-8 -*-
"""Main application settings module."""

from environs import Env

env = Env()
env.read_env()  # read .env file, if it exists


class Settings(object):

    MONGO_URI = env("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DATABASE = env("MONGO_DATABASE", "DXmaps")
    MONGO_COLLECTION = env("MONGO_COLLECTION", "dx_map_data")

    # COMMASTER IMAGES MAINLY TIF FILES
    SLNSW_COMASTERS_PATH = env(
        "SLNSW_COMASTERS_PATH",
        "/home/dimago/DATA/PERSONAL/freelance/DXLab/R&D_Maps/comaster_data/",
    )
    SPRITE_TILE_SIZE = env("SPRITE_TILE_SIZE", 512)
    SPRITE_MAX_WIDTH = env.int("SPRITE_MAX_WIDTH", 4096 * 2)
    SPRITE_MAX_HEIGHT = env.int("SPRITE_MAX_HEIGHT", 4096 * 2)


settings = Settings()
