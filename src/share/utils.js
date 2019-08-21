import union from '@turf/union';
import cleanCoords from '@turf/clean-coords';
import { get } from 'lodash';

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