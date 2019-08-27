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
              if (merge) {
                merge = union(merge, p);
              }else{
                merge = p;
              }
            });


            merge = cleanCoords(merge)
            this.cache = merge
        }
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
