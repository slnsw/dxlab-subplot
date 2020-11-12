DXLab Subplot sprite packer
==============================

What Is This?
-------------

This is a simple ETL implementation for ingesting, clean, merge and transform Klokan subplot data with other sources like SLNSW and Geolocation data of Sydney suburbs. 

All data is stored in a MongoDB instance where all RAW data is converted to JSON and save for further processing. Additionally this project also crops and extract images using the bounders extracted from Klokan.


Requirements
---------------
- Python 3.8.5
- [Pyenv](https://github.com/pyenv/pyenv) ( recommend )

     for managing python version

- [Poetry](https://python-poetry.org/)

    It will manage package and python environment


Install
---------------

with all requirements installed:

1. cd map_elt
2. Run command 
```
$ map_etl > poetry install 
```
3. Done.

Usage
---------------

1. cd map_elt

2. Create *.env* file use *.env.example* as reference

3. In a terminal
```
$ map_etl > poetry shell
$ map_etl > python cli.py <command>
```

List on available commands
-------------------------

TBD.




