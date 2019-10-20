import union from '@turf/union';
import cleanCoords from '@turf/clean-coords';
import { get } from 'lodash';

import { easeCubicIn } from 'd3-ease';
import { interpolate } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';

export class MergeGeoJsonPolygon {

    cache = null;

    setData(data) {
        if(data.length > 0) {
            let merge = undefined;
            data.forEach((p) => {
              merge = this.append(p)
            });
            this.cache = merge
        }
    }

    /**
     * Merge polygon into cache polygon data
     * @param {*} polygon 
     */
    append(polygon) {
      let merge = this.cache;
      if (merge) {
        merge = union(merge, polygon);
      }else{
        merge = polygon;
      }
      merge = cleanCoords(merge);
      this.cache = merge
      return merge;
      
    }

    getPolygon() {
        return this.cache;
    }
    getCoordinates() {
        return get(this.cache, 'geometry.coordinates', []);
    }


}


export function easeInterpolate(ease) {
  return function (a, b) {
      var i = interpolate(a, b);
      return function (t) {
          return i(ease(t));
      };
  };
}


export function interpolateScale(value, to, from) {
  return scaleLinear()
      .domain([from, to])
      .range([0, (to - from)])
      .interpolate(easeInterpolate(easeCubicIn))(value);
}

// Temporal 
export function getImageUrl(asset_id, suffix) {
  return `${process.env.REACT_APP_STATIC_BASE_URL}/${asset_id}${suffix}.png`;
}