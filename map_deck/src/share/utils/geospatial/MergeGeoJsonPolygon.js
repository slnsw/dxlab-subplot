import union from '@turf/union'
import cleanCoords from '@turf/clean-coords'
import { get } from 'lodash'

export class MergeGeoJsonPolygon {
  constructor () {
    this.cache = null
  }

  setData (data) {
    if (data.length > 0) {
      let merge
      data.forEach((p) => {
        merge = this.append(p)
      })
      this.cache = merge
    }
  }

  /**
   * Merge polygon into cache polygon data
   * @param {*} polygon
   */
  append (polygon) {
    let merge = this.cache
    if (merge) {
      // Clean coordinates to get a better render.
      // However there are invalid coordinates coming from the
      // original data. To avoid loose the entry allow bypass
      // the polygon with messy data.
      try {
        polygon = cleanCoords(polygon)
      } catch (error) {
        // ignore
      }
      merge = union(merge, polygon)
    } else {
      merge = polygon
    }
    // merge = cleanCoords(merge);
    this.cache = merge
    return merge
  }

  getPolygon () {
    return this.cache
  }

  getCoordinates () {
    return get(this.cache, 'geometry.coordinates', [])
  }
}
