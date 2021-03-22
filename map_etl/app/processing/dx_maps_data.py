# -*- coding: utf-8 -*-
"""Process Klokan and SLNSW raw data to be use with DXMap R&D."""
import re
import json
import dateparser

from logzero import logger

from pydash import py_
from geojson import Point, Polygon, Feature
from pymongo import IndexModel, GEOSPHERE
from toolz.itertoolz import partition

from app.datasource.klokan import (KlokanGoogleCSVLoader, KlokanHiddenDataLoader, KlokanWorldFileLoader)
from app.datasource.google import SearchEngineSubdivisionLoader
from app.datasource.suburbs import NSWSuburbsCSVLoader
from app.datasource.images import BaseComasterLoader
from app.datasource.slnsw import SLNSWLinkTitlesLoader, SLNSWCollectionWebsiteLoader
from app.tools.mongo_loader import MongoLoader
from app.settings import settings

from .mixins import MixinGeoJsonUtils, WorldFile


class DXMapsData(MixinGeoJsonUtils, MongoLoader):
    """Process data from multiple sources to be use with DXMaps."""
    reference_field = 'asset_id'
    database = settings.MONGO_DATABASE
    collection = 'dx_map_data'

    RE_TITLE_YEAR = re.compile(r'.*\s?,.*\s?,.*?(?P<year>\d{4}\s?$)')
    RE_DATE_HAS_YEAR = re.compile(r'.*\d{4}')
    RE_DATE_JUST_YEAR = re.compile(r'^\d{4}$')

    def conf(self):
        super().conf()

        geo_index_fields = [
            'center', 'north_east', 'south_west', 'control_points.point', 'cutline', 'cutline_centroid'
        ]
        for inx_field in geo_index_fields:
            self.collection.create_indexes([IndexModel([(inx_field, GEOSPHERE)])])

    def load_objects(self):
        """Generator that yield klokan map dictionaries."""
        qs = self.queryset(KlokanGoogleCSVLoader.collection, query={})
        for doc in qs:
            asset_id = doc['id']
            logger.debug('DXMap parsing asset {}'.format(asset_id))

            data = {'asset_id': asset_id}
            data.update(self.parse_klokan(doc))

            data.update(self.parse_klokan_hidden(asset_id))

            data.update(self.parse_slnsw_subdivision(asset_id))

            data.update(self.parse_suburbs_geocode(asset_id, data))

            data.update(self.parse_image_asset(asset_id, data))

            data.update(self.parse_discard_asset(asset_id, data))

            data.update(self.parse_slnsw_title_links(asset_id, data))

            data.update(self.parse_slnsw_collection_website(asset_id, data))

            data.update(self.find_near_assets(asset_id, data))

            # select year prefer year_subdivision over year_title if exits
            year = data.get('year_subdivision', None)
            if year is None:
                year = data.get('year_title', None)

                # If year still None check if year_creation exists
                if year is None:
                    year = data.get('year_creation', None)

            data['year'] = year

            data['valid'] = self.is_valid(asset_id, data)

            yield data

    def parse_klokan(self, obj):
        # Get data we are interested
        data = py_.pick(obj, *['title', 'thumbnail', 'center', 'north_east', 'south_west'])

        # process data
        # 1. Convert strings to GeoCoordinates
        data.update(
            {
                'center': self.str_longlat_to_geo_point(data['center']),
                'north_east': self.str_longlat_to_geo_point(data['north_east']),
                'south_west': self.str_longlat_to_geo_point(data['south_west']),
            }
        )

        # hack for metabase
        fields = ['center', 'north_east', 'south_west']
        for f in fields:
            point = data[f]
            if point:
                coordinates = point.coordinates
                data['{}_longitude'.format(f)] = coordinates[0]
                data['{}_latitude'.format(f)] = coordinates[1]

        # 2. Extract city suburb name from title
        title = py_.get(data, 'title', '')
        data['location_name'] = py_.get(title.split(','), 0)

        # 3. Extract year from title as fall back option
        match = self.RE_TITLE_YEAR.match(title)
        if match:
            year = match.group('year')
            data['year_title'] = int(year)

        return data

    def parse_klokan_hidden(self, asset_id: str) -> dict:
        """Parse data extracted from Georeference website."""
        mongo = self.get_collection(collection=KlokanHiddenDataLoader.collection)
        doc = mongo.find_one({'id': asset_id})

        data = {}
        if doc:
            # data = py_.pick(doc, *['bbox', 'control_points', 'cutline'])
            data = py_.pick(doc, *['cutline'])

        # # Convert data to GeoJson
        # bbox = data.get('bbox', [])
        # if len(bbox) > 0:
        #     bbox = Polygon(partition(2, bbox))
        #     data.update({'bbox': bbox})
        # else:
        #     data['bbox'] = None

        # # Convert control points into geolocations
        # lpoints = data.get('control_points', [])
        # npoints = []

        # if len(lpoints) > 0:
        #     for point in lpoints:
        #         metadata = py_.pick(point, *['map', 'scan_zoom', 'map_zoom', 'address', 'pixel_x', 'pixel_y'])
        #         lon = point['longitude']
        #         lat = point['latitude']
        #         point = Point([lon, lat])
        #         npoints.append({'point': point, 'metadata': metadata})

        # data['control_points'] = npoints
        # data['control_points_count'] = len(npoints)

        # load wordfile
        wld = self.get_world_file(asset_id)

        # cutline to polygon
        cutline = data.get('cutline', [])
        if wld and cutline:
            polygon = self.pixels_to_geo_polygon(cutline, wld)
            data.update({'cutline': polygon})
            data.update({'cutline_centroid': self.centroid(polygon)})

        # bbox using the following format
        # [[left, bottom], [left, top], [right, top], [right, bottom], [left, bottom]]
        # [[west, south], [west, north], [east, north], [east, south], [west, south]]
        w = py_.get(doc, 'pyramid.width')
        h = py_.get(doc, 'pyramid.height')
        bbox_coord = [[0, h], [0, 0], [w, 0], [w, h]]

        if wld:
            polygon = self.pixels_to_geo_polygon(bbox_coord, wld, validated=False)
            data.update({'bbox_coord': polygon})

        return data

    def get_world_file(self, asset_id: str) -> WorldFile:
        mongo = self.get_collection(collection=KlokanWorldFileLoader.collection)
        doc = mongo.find_one({'asset_id': asset_id}, projection={'A', 'B', 'C', 'D', 'E', 'F'})

        wld = None
        if doc:
            doc.pop('_id', None)
            doc = {k: float(v) for k, v in doc.items()}
            wld = WorldFile(**doc)

        return wld

    def parse_slnsw_subdivision(self, asset_id: str) -> dict:
        """Parse subdivision data extracted from data collected from the search engine.
        Data here are mainly loaded fom the SLNSW website.
        """
        data = {}
        mongo = self.get_collection(collection=SearchEngineSubdivisionLoader.collection)
        doc = mongo.find_one({'dig_id': asset_id})

        if doc:
            data = py_.pick(doc, 'year', 'location_name', 'boundaries', 'call_no', 'date')

            # parse year
            try:
                data['year'] = int(data.get('year'))
            except:
                data['year'] = None

            # parse date
            date_str = data.get('date')
            date = None
            if self.RE_DATE_HAS_YEAR.match(date_str):
                # clean date string
                date_str = date_str.replace('[', '')
                date_str = date_str.replace(']', '')
                date_str = date_str.strip()

                if self.RE_DATE_JUST_YEAR.match(date_str):
                    date_str = '{}-1-1'.format(date_str)

                date = dateparser.parse(date_str, settings={'STRICT_PARSING': True})

            data['date'] = date

            # Use date year if year is not in found and the row has a date
            if date and not data['year']:
                data['year'] = date.year

            data['date_str'] = date_str

            # Drop empty or none data
            data = {k: v for k, v in data.items() if v}

            # Add suffix for now
            data = {'{}_subdivision'.format(k): v for k, v in data.items()}

        return data

    def parse_suburbs_geocode(self, asset_id: str, data: dict) -> dict:
        out = {}
        center = data.get('center', None)
        location_name = data.get('location_name', None)
        if center and location_name:
            # '$minDistance': 500
            query = {'geo_location': {'$near': {'$geometry': center, '$maxDistance': 2000}}}

            mongo = self.get_collection(collection=NSWSuburbsCSVLoader.collection)
            qs = mongo.find(query, projection={'suburb': 1, 'geo_location': 1})
            # print('s ->', location_name)
            nearest = None
            location_match = False
            for row in qs:
                # Start for selecting the nearest point before comparing names
                if nearest is None:
                    nearest = row
                option = row['suburb']
                # print(option)
                match = re.match(location_name, option, re.IGNORECASE)
                # Use first match because is the nearest to the given point
                if match:
                    location_match = True
                    nearest = row
                    break
            if nearest:
                out['location_name'] = nearest['suburb']
                out['location_point'] = nearest['geo_location']
                out['location_match'] = location_match
                # print('f ->', location_match, nearest['suburb'], location_name)

            # Add suffix for now
            out = {'{}_postal'.format(k): v for k, v in out.items()}

            return out

    def parse_image_asset(self, asset_id: str, data: dict) -> dict:

        query = {'asset_id': asset_id}
        mongo = self.get_collection(collection=BaseComasterLoader.collection)
        doc = mongo.find_one(query)
        out = doc or {}

        out['missing_image'] = doc is None

        if out:
            similar = out.get('similar', [])
            out['has_similar'] = len(similar) > 0

        return out

    def find_near_assets(self, asset_id: str, data: dict) -> dict:
        """Find near assets base on centroid of the shape."""

        query = {'center': {'$near': {'$geometry': data['center'], '$maxDistance': 500}}}
        qs = self.collection.find(query, {'asset_id': 1, 'year': 1, 'iiif_identifier': 1})

        # Merge with similar and set distance as 0
        similar = data.get('similar', [])
        similar = similar + [
            py_.pick(i, 'asset_id', 'year', 'iiif_identifier') for i in qs if i.get('year', None) is not None
        ]
        out = {'similar': similar}

        return out

    def parse_discard_asset(self, asset_id: str, data: dict) -> dict:

        query = {'asset_id': asset_id}
        mongo = self.get_collection(collection='dx_map_exclude')
        doc = mongo.find_one(query)
        return {'active': doc is None}

    def parse_slnsw_title_links(self, asset_id: str, data: dict) -> dict:

        query = {'asset_id': asset_id}
        mongo = self.get_collection(collection=SLNSWLinkTitlesLoader.collection)
        doc = mongo.find_one(query)
        out = {}

        if doc:
            out = py_.pick(doc, 'collection_title', 'url_id')

        return out

    def parse_slnsw_collection_website(self, asset_id: str, data: dict) -> dict:

        query = {'asset_id': asset_id}
        mongo = self.get_collection(collection=SLNSWCollectionWebsiteLoader.collection)
        doc = mongo.find_one(query)
        out = {}

        if doc:
            errors = py_.get(doc, 'props.pageProps.errors', None)
            if errors is not None:
                return {'collection_url_error': errors}

            props = py_.get(doc, 'props.pageProps', {})

            # Zoomify URL
            full_iiif_url = py_.get(props, 'file.image.iiifImageUrl', None)
            out['iiif_identifier'] = full_iiif_url.split('/')[-1]
            out['full_iiif_url'] = full_iiif_url

            # Check if we have the full title
            title = py_.get(props, 'title', '')
            if data.get('collection_title', '') != title:
                out['collection_title'] = title
                out['collection_title_expanded'] = True

            notes = py_.get(props, 'recordData.notes', [])
            date_creation = py_.find(notes, {'type': 'dateCreation'})
            if date_creation is not None:
                date_creation = py_.get(date_creation, 'value', None)
                out['date_creation'] = date_creation

                # Extract latest year in the date_creation as option
                # if year is null
                if isinstance(date_creation, str):
                    data_creation = date_creation.replace('.', '')
                    bits = data_creation.split('-')

                    try:
                        year = bits[-1]
                        year = year if year != '' else bits[0]

                        out['year_creation'] = int(year)
                    except:
                        out['year_creation'] = None

        return out

    def is_valid(self, asset_id: str, data: dict) -> bool:

        valid = True
        cutline_coords = py_.get(data, 'cutline.coordinates.0', [])

        if len(cutline_coords) == 0:
            valid = False

        return valid


class DXMapsGEOJSONData(MixinGeoJsonUtils, MongoLoader):
    """Format DXMaps data as GEOJson feature."""
    reference_field = 'properties.asset_id'
    database = settings.MONGO_DATABASE
    collection = 'dx_geojson_map_data'

    def load_objects(self):
        """Generator that yield klokan map dictionaries."""
        # Clean collection
        self.collection.remove({})

        # Re-create data
        qs = self.queryset(DXMapsData.collection, query={'valid': True, 'active': True})
        for doc in qs:
            logger.debug('DXMap creating GEOJson for {asset_id}'.format(**doc))

            geometry = py_.get(doc, 'cutline.coordinates', None)
            # If cutline exists is a valid map
            if geometry:
                poly = Polygon(geometry)

                # Build feature properties
                properties = py_.pick(
                    doc, 'year', 'collection_title', 'asset_id', 'url_id', 'colorfulness', 'iiif_identifier',
                    'colored', 'cutline_centroid', 'similar', 'bbox_coord', 'location_name', 'width', 'height'
                )
                properties = py_.rename_keys(
                    properties, {
                        'cutline_centroid': 'centroid',
                        'bbox_coord': 'image_bounds',
                        'collection_title': 'title',
                        'url_id': 'collection_id'
                    }
                )

                # build feature
                feature = Feature(geometry=poly, properties=properties)
                yield feature

        self.export_to_json()
        return []

    def export_to_json(self):
        logger.debug('Creating JSON file')
        qs = self.collection.find({})
        total = qs.count()
        file = open("./data/export/subdivisions.json", "w")
        file.write('[')
        for i, doc in enumerate(qs, 1):
            doc.pop('_id')
            file.write(json.dumps(doc))
            if i != total:
                file.write(',')
        file.write(']')
        logger.debug('Done JSON file')
