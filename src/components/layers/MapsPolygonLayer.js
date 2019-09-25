
import { CompositeLayer } from 'deck.gl';
import { GeoJsonLayer } from '@deck.gl/layers';

import { pick } from 'lodash';

import { scaleLinear } from 'd3-scale';
import { color } from 'd3-color'
import { easeCubicIn } from 'd3-ease';

export class MapsPolygonLayer extends CompositeLayer {

    // state = {
    //     elev: 0
    // }

    updateState({props, changeFlags}) {
        if(changeFlags.dataChanged){
            const { data } = props;
            const features = data.map((m) => {    
                return {
                    type: 'feature',
                    geometry: m.cutline, 
                    properties: pick(m, ['year', 'title', 'asset_id'])
                };
            });
    
            const feature = { 
                'type': 'FeatureCollection',
                'features': features
    
            }

            this.setState({feature, elev: 0});

        }
    }

    buildLayer(data) {
        const { id, mapContext: [mapState, distpatch] } = this.props;
        const {years: {from, to}} = mapState;
        const yearColorScale = scaleLinear([from, to], ["gold", "limegreen"]);
        
        const {elev} = this.state;
        // console.log(elev);

        return new GeoJsonLayer({
            id: `${id}-maps-polygon-layer`,
            data: this.state.feature,
            extruded: true,
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
            getElevation: (d) => d.properties.year * elev, 
            // updateTriggers: {
            //     getElevation: [elev]
            // },
            // transitions: {
            //     getElevation: 600,
            //     getFillColor: {
            //       duration: 300,
            //       easing: easeCubicIn,
            //       enter: value => [value[0], value[1], value[2], 255] // fade in
            //     }
            // }
               
        });
    }

    getPickingInfo(pickParams) {
        // console.log(this.state);
        // this.setState({elev: 100});
        return pickParams.info;
    }

    renderLayers() {
        const { data } = this.props;
        return this.buildLayer(data);
    }


}

MapsPolygonLayer.layerName = 'MapsPolygonLayer';

