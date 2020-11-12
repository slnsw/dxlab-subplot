DXLab Subplot sprite packer
==============================

What Is This?
-------------

This simple script that generate optimize PNG images sprites along with a JSON file indexes. This sprites compatibles with DXLab-Subplot project data structure, but can be use in other context. 

The sprites are generated using pyTexturePacker and optimize with [Crunch](https://github.com/chrissimpkins/Crunch)

Currently the script is hard code to generate tiles of 512 pixels in a final texture of 8192 x 8192 pixels. This parameters are define to allow the most amount of maps in a texture with the best possible quality allow by memory size and number of textures allow in a WebGl 1.0 shader. 

Why implement a sprite generator if there are multiple Texture packers some open source others commercial like [TexturePacker](https://www.codeandweb.com/texturepacker). The problem was that most of them failed to generated big textures or had trouble reading large source images, like is the case of DXLab-subplot.

Requirements
---------------
- Python 3.8.5
- [Pyenv](https://github.com/pyenv/pyenv) ( recommend )

     for managing python version

- [Poetry](https://python-poetry.org/)

    It will manage package and python environment

- [Crunch](https://github.com/chrissimpkins/Crunch)

Install
---------------

with all requirements installed:

1. cd map_packer
2. Run command 
```
$ map_packer > poetry install 
```
3. Done.

Usage
---------------

1. set DIRECTORY_IMAGES the variable at *main.py*  to the path where source images are located.

2. set SIZE at *main.py* to the target tile size of each image.

3. set MAX_WIDTH and MAX_HEIGHT at the *main.py*. **stick to powers-of-two for texture sizes**.

4. In a terminal
```
$ map_packer > poetry shell
$ map_packer > python main.py
```

5. in the output folder a folder with the tile size will be create with PNG files and JSON indexes.




