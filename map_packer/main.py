import re
import os
import json
import glob
import errno
import plistlib

from pathlib import Path
from collections import defaultdict, namedtuple

from logzero import logger
from PyTexturePacker import Packer
from PyTexturePacker.MaxRectsPacker.MaxRectsPacker import MaxRectsPacker

try:
    from sh import crunch, ErrorReturnCode
except:
    crunch = lambda *args, **kwargs: logger.critical(
        "Please install crunch for PNG optimization"
    )

DIRECTORY_IMAGES = "/home/dimago/DATA/PERSONAL/freelance/DXLab/R&D_Maps/comaster_data/"
RE_DIM = re.compile(r"\d+")
SIZE = "512"
# MAX_WIDTH = 2048
# MAX_HEIGHT = 2048
MAX_WIDTH = 4096 * 2
MAX_HEIGHT = 4096 * 2

Rect = namedtuple("Rect", ["x", "y", "w", "h"])
Dimensions = namedtuple("Dimensions", ["w", "h"])
Point = namedtuple("Point", ["x", "y"])


def pack():
    # Create output size folder
    Path(f"./{SIZE}").mkdir(parents=True, exist_ok=True)
    files = [
        str(f)
        for f in Path(DIRECTORY_IMAGES).glob(f"*_crop_{SIZE}*")
        if f.suffix == ".png"
    ]

    packer = Packer.create(
        packer_type=MaxRectsPacker,
        max_width=MAX_WIDTH,
        max_height=MAX_HEIGHT,
        bg_color=0x00000000,
        trim_mode=False,
        enable_rotated=True,
    )
    packer.pack(files, f"./{SIZE}/subdivisions_%d")


def plist_to_json():
    # Silly but PyTexturePacker only exports .plist and we need a json file
    # Find all  .plist file in the given directory and convert to json
    # and also modify  they file id.

    directory = f"./{SIZE}"
    plist_files = (f for f in Path(directory).glob("*") if f.suffix == ".plist")
    for path in plist_files:
        out = defaultdict(dict)
        with path.open("rb") as file:
            plist = plistlib.load(file)

            for key in plist["frames"]:
                # Get data
                data = plist["frames"][key]
                # Drop file suffix and extension
                key = key.split("_")[0]

                frame = parse_dimesions(data["frame"], Rect)
                rotated = data["rotated"]

                # There is a bug in the coordinates of PyTexturePacker
                # when a texture is rotate the frame width and height are inverted
                if rotated:
                    frame = Rect(frame[0], frame[1], frame[3], frame[2])

                item = {
                    **frame._asdict(),
                    # "size": parse_dimesions(data["sourceSize"], Dimensions)._asdict(),
                    "rotated": rotated,
                    # "offset": parse_dimesions(data["offset"], Point)._asdict(),
                }
                out["frames"][key] = item

            # add metadata information to the file
            metadata = plist["metadata"]
            out.update(
                {
                    # "size": parse_dimesions(metadata["size"], Dimensions)._asdict(),
                    "filename": Path(metadata["textureFileName"]).name,
                }
            )

            filename = path.name.replace(path.suffix, "")
            with open(f"{directory}/{filename}.json", "w") as outfile:
                json.dump(out, outfile)


def optimize_sheets():
    try:
        logger.info("Cleaing old crunch files...")
        expr_delete = re.compile(f".*-crunch.png")
        for f in Path(f"./{SIZE}").iterdir():
            if f.is_file:
                if expr_delete.match(f.name):
                    f.unlink()

        for line in crunch(glob.glob(f"./{SIZE}/*.png"), _iter_noblock=True):
            if line != errno.EWOULDBLOCK:
                logger.info(line[:-1])

    except ErrorReturnCode as e:
        logger.error(f"Crunch -> {e.stderr}")


def cleaning():
    directory = f"./{SIZE}"
    expr_delete = re.compile(f".*(\.plist|_[0-9]+\.png)")
    expr_rename = re.compile(f".*_[0-9]+-crunch\.png")

    for f in Path(directory).iterdir():
        if f.is_file:
            if expr_delete.match(f.name):
                try:
                    # f.unlink()
                    print("delete", f.name)
                except OSError as e:
                    print("Error: %s : %s" % (f, e.strerror))

            if expr_rename.match(f.name):
                new_name = f.name.replace("-crunch", "")
                f.rename(f"{directory}/{new_name}")
                # print("rename", new_name, f.name)


def parse_dimesions(dims: str, Convert: namedtuple = None):
    values = [int(v) for v in RE_DIM.findall(dims)]
    if Convert:
        return Convert(*values)
    return values


if __name__ == "__main__":
    print("Run")
    pack()
    plist_to_json()
    optimize_sheets()
    cleaning()
