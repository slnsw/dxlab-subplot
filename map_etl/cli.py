# -*- coding: utf-8 -*-
#!/usr/bin/env python3
import click
import logzero

from app.datasource.klokan import (
    KlokanGoogleCSVLoader, KlokanHiddenDataLoader, KlokanGeoreferenceFilesLoader, KlokanWorldFileLoader
)
from app.datasource.slnsw import SLNSWSubdivisionsCSVLoader, SLNSWLinkTitles
from app.datasource.images import (ComasterImagesLoader, ComasterDuplicateImageLoader, ComasterImageProcessLoader)
from app.datasource.google import SearchEngineHackDataLoader, SLNSWSubdivisionIndexLoader, SLNSWSubdivisionLoader
from app.datasource.suburbs import NWSSuburbsCSVLoader
from app.processing.dx_maps_data import DXMapsData, DXMapsGEOJSONData

from logzero import logger

log_kwargs = {'maxBytes': 1e6, 'backupCount': 3}
log_file = './logs/output.log'

# Configure aggregator logs to use logzero

# Default Configure log file
logzero.logfile(log_file, **log_kwargs)


@click.group()
def cli():
    pass


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_klokan_raw_data():
    """Load raw klokan data and store in a MongoDB collection."""
    # 1. GeoReferencer
    csv_loader = KlokanGoogleCSVLoader()
    csv_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_klokan_hidden_data():
    """Load hidden data from GeoReferencer website."""
    # 1. Ingest control points
    web_loader = KlokanHiddenDataLoader()
    web_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def download_klokan_assoc_files():
    """Extract files and metadata associated to klokan maps on the GeoReferencer website."""
    # 1. Ingest control points
    web_loader = KlokanGeoreferenceFilesLoader()
    web_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_klokan_world_files():
    """Ingest world file of each asset."""
    # 1. Ingest world file
    wld_loader = KlokanWorldFileLoader()
    wld_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_subdivisions_raw_data():
    """Ingest raw subdivision data of SLNSW collection."""
    csv_loader = SLNSWSubdivisionsCSVLoader()
    csv_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_title_links_raw_data():
    """Ingest raw Titles and Links from SLNSW collection from ingested Klokan records"""
    json_loader = SLNSWLinkTitles()
    json_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_comaster_data():
    """Load and process comaster images."""
    # Ingest SLNSW provided data to Klokan
    image_loader = ComasterImagesLoader()
    image_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_comaster_duplicates():
    """Detect duplicates within the comaster images."""
    # Ingest SLNSW provided data to Klokan
    image_loader = ComasterDuplicateImageLoader()
    image_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_comaster_processing():
    """Apply cut line, edge detection, etc of comaster images."""
    # Ingest SLNSW provided data to Klokan
    image_loader = ComasterImageProcessLoader()
    image_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_nsw_suburbs_raw_data():
    """Load NSW suburb list of names and geocodes."""
    # Ingest SLNSW provided data to Klokan
    csv_loader = NWSSuburbsCSVLoader()
    csv_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_search_engine_hack_data():
    """Use google or duckduckgo to get more information for each asset"""
    google_loader = SearchEngineHackDataLoader()
    google_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_subdivision_index_raw_data():
    """Using search engine create an index of  subdivision data from SLNSW"""
    google_loader = SLNSWSubdivisionIndexLoader()
    google_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def ingest_slnsw_subdivision_raw_data():
    """Using search engine data extract subdivision data from SLNSW"""
    google_loader = SLNSWSubdivisionLoader()
    google_loader.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def processing_dx_map_data():
    """Clean, match, data to use with DX Map R&D."""
    # Ingest SLNSW provided data to Klokan
    dx_map = DXMapsData()
    dx_map.execute()


@cli.command()
@click.confirmation_option(prompt='Do you want to continue?')
def generate_dx_geojson_map_data():
    """Clean, match, data to use with DX Map R&D."""
    # Create GEOJson data export of the DX map processed data
    dx_map = DXMapsGEOJSONData()
    dx_map.execute()


if __name__ == '__main__':
    cli()
