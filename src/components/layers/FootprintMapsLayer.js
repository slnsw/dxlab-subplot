
import { CompositeLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';

import { pick, cloneDeep } from 'lodash';
import { MergeGeoJsonPolygon } from '../../share/utils';


export class FootprintMapsLayer extends CompositeLayer { 


    mergeMapFootprint(data) {
        data = data.map((m) => {    
          const polygon = cloneDeep(m.cutline);
          polygon['properties'] = pick(m, ['year', 'title', 'asset_id']);
    
          return m.cutline;
        });
    
        const merge = new MergeGeoJsonPolygon();
        merge.setData(data);
        return merge.getCoordinates();
    
      }


    buildLayer() {
        // const {mapContext:[mapState]} = this.props;
        // let data = mapState.data.then((data) => {
        //     const parse = this.mergeMapFootprint(data);
        //     return parse;
        // });

        let { data } = this.props;
        data = this.mergeMapFootprint(data);

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
        return [this.buildLayer()];
    }


}

FootprintMapsLayer.layerName = 'FootprintMapsLayer';