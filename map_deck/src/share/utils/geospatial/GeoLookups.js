
import RBush from 'rbush'
import bbox from '@turf/bbox'
import circle from '@turf/circle'
import booleanOverlap from '@turf/boolean-overlap'
import booleanContains from '@turf/boolean-contains'
import GeoJsonGeometries from 'geojson-geometries'

import { map } from 'lodash'

export class GeoLookups {
  constructor (geoJson) {
    // BBox index
    this.BBIndex = new RBush()

    // If is an array wrap around a FeatureCollection
    if (Array.isArray(geoJson)) {
      geoJson = {
        type: 'FeatureCollection',
        features: geoJson
      }
    }

    // Extract polygons from the feature collection
    const extracted = new GeoJsonGeometries(geoJson)
    const { features } = extracted.polygons
    this.features = features

    // Extract BBOX of all features
    const bounds = features.map((polygon, idx) => {
      const [minX, minY, maxX, maxY] = bbox(polygon)
      return { minX, minY, maxX, maxY, id: idx }
    })
    this.BBIndex.load(bounds)
  }

  /**
   * Find features within a distance from a given point.
   * Returns array of GeoJSON features found.
   * @param {*} center
   * GeoJson point
   * @param {*} radius
   * Distance in kilometers from the given point.
   * Default value is 2 Km.
   */
  getIntersectWithin (center, radius = 2) {
    const roi = circle(center, radius, { units: 'kilometers' })
    return this.getIntersect(roi.geometry)
  }

  /**
   * Get count of features within a distance from a given point.
   * @param {*} center
   * GeoJson point
   * @param {*} radius
   * Distance in kilometers from the given point.
   * Default value is 2 Km.
   */
  countIntersectWithin (center, radius) {
    const roi = circle(center, radius, { units: 'kilometers' })
    return this.countIntersect(roi.geometry)
  }

  /**
   * Get count of features that intersect with the given GeoJSON
   * geometry.
   * @param {*} geometry
   */
  countIntersect (geometry) {
    const intersect = this._searchIndex(geometry)
    return intersect.length
  }

  /**
   * Find features that intersect with the given GeoJSON
   * geometry.
   * Returns array of GeoJSON features found.
   * @param {*} geometry
   */
  getIntersect (geometry) {
    return this._searchIndex(geometry)
  }

  _searchIndex (geometry) {
    // Dummy check if is a GeoJson geometry
    const { type: geoType = 'unknown' } = geometry

    if (['Point', 'lineString', 'Polygon'].indexOf(geoType) === -1) {
      throw new Error('Invalid lookup geometry')
    }

    // Get boundaries of the geometry to lookup
    const [minX, minY, maxX, maxY] = bbox(geometry)
    const query = { minX, minY, maxX, maxY }
    // Search in the index what boundaries intersect with the geometry
    const intersect = this.BBIndex.search(query)

    // Test they overlay with the given geometry
    const idxs = map(intersect, 'id')
    const match = idxs.reduce((result, idx) => {
      const geo = this.features[idx]
      const overlay = booleanOverlap(geo, geometry)
      const contains = booleanContains(geo, geometry) || booleanContains(geometry, geo)
      if (overlay || contains) {
        result.push(geo)
      }
      return result
    }, [])

    return match
  }
}
