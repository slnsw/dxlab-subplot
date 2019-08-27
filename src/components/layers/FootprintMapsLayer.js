
import { CompositeLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';

import { pick, cloneDeep } from 'lodash';
import { MergeGeoJsonPolygon } from '../../share/utils';


export class FootprintMapsLayer extends CompositeLayer { 


    mergeMapFootprint(data) {
        data = data.map((m) => {
          // Change eleveation base on year
          // m.cutline.coordinates[0] = m.cutline.coordinates[0].map((c: any) => {
          //   //const elv = 20 *  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);
          //   c.push(0);
          //   return c;
    
          // });
    
          const polygon = cloneDeep(m.cutline);
          polygon['properties'] = pick(m, ['year', 'title', 'asset_id']);
    
          return m.cutline;
        });
    
        const merge = new MergeGeoJsonPolygon();
        merge.setData(data);
        return merge.getCoordinates();
    
      }


    mapPoints() {
        const {mapContext:[mapState]} = this.props;
        let data = mapState.data.then((data) => {
            const parse = this.mergeMapFootprint(data);
            return parse;
        });

        return new PolygonLayer({
            id: 'footprint-layer',
            data: data,
            extruded: false,
            stroked: false,
            getLineWidth: 0,
            getPolygon: (d) => d,
            getFillColor: (d) => {
                // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);
                return [0, 0, 0, 50];
            },
        });

    }



    renderLayers() {
        return [this.mapPoints()];
    }


}

FootprintMapsLayer.layerName = 'FootprintMapsLayer';