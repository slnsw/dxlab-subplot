# -*- coding: utf-8 -*-
"""Find information of the maps using google search."""

import re
import os
import csv
import json
import time
import random
import requests

from typing import Iterable

from logzero import logger
from pyquery import PyQuery as pq
from lxml import etree, html
from urllib.parse import unquote
from slugify import slugify
from toolz.itertoolz import partition_all
from pymongo import IndexModel

from app.tools.mongo_loader import MongoLoader
from app.settings import settings

from app.datasource.klokan import KlokanGoogleCSVLoader


class SearchEngineHackDataLoader(MongoLoader):

    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_google_hack'

    def query_google(self, terms: str) -> list:
        tpl = 'https://google.com.au/search?q={terms}&start=0&num=100&gws_rd=cr&gl=us'
        url = tpl.format(terms=terms)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-AU',
            'Accept-Encoding': 'gzip, deflate',
        }

        r = requests.get(url, headers=headers, verify=False)
        r.raise_for_status()

        whitelist = ['www.oldmapsonline.org', 'data.gov.au', 'www2.sl.nsw.gov.au']

        d = pq(r.content)
        google_links = []

        results = d('div.g')
        for result in results:
            link = pq(result)('a').eq(0).attr('href')
            link = link.replace('/url?q=', '')
            if any(domain in link for domain in whitelist):
                logger.debug('Found: {}'.format(link))
                google_links.append(link)

        return google_links

    def query_duckgo(self, terms: str) -> list:
        tpl = 'https://duckduckgo.com/html/?q={terms}'
        url = tpl.format(terms=terms)

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-AU',
            'Accept-Encoding': 'gzip, deflate',
        }

        r = requests.get(url, headers=headers, verify=False)
        r.raise_for_status()

        whitelist = ['www.oldmapsonline.org', 'data.gov.au', 'www2.sl.nsw.gov.au']

        tree = html.fromstring(r.content)
        results = tree.xpath('//div[@id="links"]//a[@class="result__a"]/@href')
        links = []

        for link in results:
            link = link.replace('/l/?kh=-1&uddg=', '')
            if any(domain in link for domain in whitelist):
                link = unquote(link)
                logger.debug('Found: {}'.format(link))
                links.append(link)

        return links

    def load_objects(self, *args, **kwargs):

        qs = self.queryset(KlokanGoogleCSVLoader.collection, query={})
        for doc in qs:
            try:
                wait = True
                asset_id = doc['id']
                gdoc = self.collection.find_one({'id': asset_id})
                if not gdoc:
                    logger.debug('Searching {}'.format(asset_id))

                    links = self.query_duckgo('NSW+{}'.format(asset_id))

                    yield {'id': asset_id, 'google_links': links}

                else:
                    wait = False
                    logger.debug('Skip {}'.format(asset_id))
            except Exception as e:
                logger.exception('Fail {} -> {}'.format(asset_id, str(e)))

            if wait:
                wait_sec = int(random.random() * 60)
                logger.debug('Waiting {} : {}s'.format(asset_id, wait_sec))
                time.sleep(wait_sec)


# Extract from search engine raw subdivision data
class SLNSWSubdivisionIndexLoader(MongoLoader):
    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw_subdivision_index_hack'

    RE_SLNSW_SUBDIVISION_URL = re.compile(
        r'https?://www2.sl.nsw.gov.au/content_lists/subdivision_plans/(?P<location>.*)\.html'
    )

    def get_slnsw_links(self):
        col = self.get_collection(SearchEngineHackDataLoader.collection, SearchEngineHackDataLoader.database)
        result = col.aggregate(
            [
                {
                    '$match': {
                        'google_links.0': {
                            '$exists': 1
                        }
                    }
                }, {
                    '$unwind': '$google_links'
                }, {
                    '$match': {
                        'google_links': {
                            '$regex': self.RE_SLNSW_SUBDIVISION_URL
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$google_links',
                        'asset_id': {
                            '$push': '$id'
                        }
                    }
                }
            ]
        )
        return list(result)

    def load_objects(self, *args, **kwargs):
        qs = self.get_slnsw_links()
        for doc in qs:
            url = doc['_id']
            match = self.RE_SLNSW_SUBDIVISION_URL.match(url)
            if match:
                location_name = match.group('location')
                id = location_name

                data = {'id': location_name, 'location_name': location_name, 'asset_id': doc['asset_id'], 'url': url}

            yield data


# Extract from search engine raw subdivision data
class SLNSWSubdivisionLoader(MongoLoader):
    reference_field = 'id'
    database = settings.MONGO_DATABASE
    collection = 'raw_slnsw_subdivision_hack'

    def conf(self):
        super().conf()

        index_fields = ['location_name', 'dig_id']
        for inx_field in index_fields:
            self.collection.create_indexes([IndexModel([(inx_field, 1)])])

    def load_data(self, url: str) -> Iterable:
        data = []
        logger.debug('Getting hidden data from: {}'.format(url))

        d = pq(url=url)
        headers = (pq(e).text() for e in d('table.striped-table th'))
        headers = [slugify(h, separator="_") for h in headers]

        # table data
        cells = d('table.striped-table td')
        for grp in partition_all(len(headers), cells):
            values = [pq(i).text() for i in grp]
            data.append(dict(zip(headers, values)))

        return data

    def load_objects(self, *args, **kwargs):
        qs = self.queryset(SLNSWSubdivisionIndexLoader.collection, {})
        for doc in qs:
            url = doc['url']
            location = doc['location_name'].replace('_', ' ').title()

            data = self.load_data(url)
            for i, row in enumerate(data):
                row['id'] = '{}_{}'.format(doc['location_name'], i)
                row['url'] = url
                row['location_name'] = location
                yield row
