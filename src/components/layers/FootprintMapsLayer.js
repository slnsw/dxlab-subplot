
import { CompositeLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';

import { MergeGeoJsonPolygon } from '../../share/utils';


export class FootprintMapsLayer extends CompositeLayer { 


    updateState({props, changeFlags}) {
        if(changeFlags.dataChanged){        
            const  { data } = props;

            // Only merget cutline polygon data
            const cutlines = data.map((m) => m.cutline); 

            // Merge polygons
            const merge = new MergeGeoJsonPolygon();
            merge.setData(cutlines);

            // Get only coordinates
            const footprintData = merge.getCoordinates();
            this.setState({footprintData});
        }
    
    }


    footprintLayer() {
        const { id } = this.props;
        const {footprintData } = this.state

        return new PolygonLayer({
            id: `${id}-footprint-layer`,
            data: footprintData,
            extruded: false,
            stroked: false,
            getLineWidth: 0,
            getPolygon: (d) => d,
            getFillColor: (d) => {
                // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);
                return [0, 0, 0, 100];
            },
        });

    }



    renderLayers() {
        return [this.footprintLayer()];
    }


}

FootprintMapsLayer.layerName = 'FootprintMapsLayer';