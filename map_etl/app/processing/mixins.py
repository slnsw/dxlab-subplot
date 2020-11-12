from typing import List, Tuple
from collections import namedtuple

from geojson import Point, Polygon
from shapely import geometry

WorldFile = namedtuple('WorldFile', ['A', 'D', 'B', 'E', 'C', 'F'])


class MixinGeoJsonUtils(object):
    def XY_to_coordinates(self, x: float, y: float, wld: WorldFile) -> list:
        """Convert pixel point to longitude and latitude."""
        longlat = [0, 0]
        # X pixel to Longitude
        longlat[0] = self.x_to_longitude(x, y, wld)

        # Y pixel to Longitude
        longlat[1] = self.y_to_latitude(x, y, wld)

        return longlat

    def x_to_longitude(self, x: float, y: float, wld: WorldFile) -> float:
        """Convert x pixel to longitude."""
        return (wld.A * x) + (wld.B * y) + wld.C

    def y_to_latitude(self, x: float, y: float, wld: WorldFile) -> float:
        """Convert y pixel to latitude."""
        return (wld.D * x) + (wld.E * y) + wld.F

    def pixel_to_geo_point(self, x: float, y: float, wld: WorldFile) -> Point:
        """Convert pixel to a GeoJson point using given world filed."""
        longlat = self.XY_to_coordinates(x, y, wld)
        point = Point(longlat)

        if not point.is_valid:
            point = None

        return point

    def pixels_to_geo_polygon(self, pixels: List[Tuple[float, float]], wld: WorldFile, validated=True) -> Polygon:
        """Convert list of pixels to a GeoJson polygon using given world filed."""
        coordinates = []
        for xy in pixels:
            longlat = self.XY_to_coordinates(xy[0], xy[1], wld)
            coordinates.append(longlat)

        polygon = Polygon(coordinates=[coordinates])
        if validated:
            return self.fix_loop_crossing(polygon)
        else:
            return polygon

    def str_longlat_to_geo_point(self, str_point: str) -> Point:
        """Convert string longitude and latitude representation to GeoJson point."""
        loc = [0, 0]
        if str_point:
            bits = str_point.split(',')
            bits.reverse()
            loc = list(map(lambda x: float(x), bits))
            if len(loc) > 2:
                loc = [0, 0]

        point = Point(loc)
        if not point.is_valid:
            point = None

        return Point(loc)

    def fix_loop_crossing(self, polygon: Polygon):
        if polygon.is_valid:
            # Fix LineaRing loop crossing
            # https://stackoverflow.com/questions/52539164/how-to-fix-geojson-to-satisfy-the-needs-of-a-mongodb-2dsphere-index?answertab=active#tab-top

            shp = geometry.shape(polygon)
            shp = shp.buffer(1e-12, resolution=0)
            polygon = geometry.mapping(shp)
            # print(polygon.is_valid)
            return polygon

    def centroid(self, polygon: Polygon):
        shp = geometry.shape(polygon)
        coords = list(shp.centroid.coords)
        if len(coords) == 1:
            coords = coords[0]
        return Point(coords)