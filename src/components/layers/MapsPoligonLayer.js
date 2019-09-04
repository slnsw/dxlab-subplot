
import { CompositeLayer } from 'deck.gl';
import { GeoJsonLayer } from '@deck.gl/layers';

import { pick, cloneDeep } from 'lodash';

import { scaleLinear } from 'd3-scale';
import { color } from 'd3-color'

export class MapsPoligonLayer extends CompositeLayer {


    buildLayer(data) {
        const features = data.map((m) => {    
            return {
                type: 'feature',
                geometry: cloneDeep(m.cutline),
                properties: pick(m, ['year', 'title', 'asset_id'])
            };
        });

        const feature =  { 
            'type': 'FeatureCollection',
            'features': features

        }

        const { mapContext: [mapState, distpatch] } = this.props;
        const {years: {from, to}} = mapState;
        const yearColorScale = scaleLinear([from, to], ["gold", "limegreen"]);

        return new GeoJsonLayer({
            id: 'maps-polygon-layer',
            data: feature,
            extruded: false,
            stroked: true,
            pickable: true,
            autoHighlight: true,
            getLineWidth: 1,
            getFillColor: (d) => {
                // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);
                let c = color(yearColorScale(d.properties.year));
                if (c) {
                    c = [c.r, c.g, c.b];
                }
                return c;
            },
            onClick: ({object, x, y}) => {
                console.log(object);
            } 
               
        });
    }

    getPickingInfo(pickParams) {
        console.log('compositive', pickParams);
    }

    renderLayers() {
        const { data } = this.props;
        return this.buildLayer(data);
    }


}

MapsPoligonLayer.layerName = 'MapsPoligonLayer';

