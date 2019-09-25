
import {CompositeLayer} from 'deck.gl';

import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class SearchResultLayer extends CompositeLayer {


    roiAreaLayer() {
        const {id, mapContext:[mapState]} = this.props;
        const {aroundRadius, around} = mapState;
        return new GeoJsonLayer({
            id: `${id}-roi-area`,
            data:  around,
            getFillColor: [0, 0, 0, 30],
            getRadius: (d) => { 
                const {properties:{zoom}} = d; 
                return aroundRadius; //+ (500 * ( 20 - zoom)); // * (20 - zoom); 
            },
            // pointRadiusMinPixels: 10,
            // pointRadiusMaxPixels: 10
          });
    }
    
 
    
    renderLayers() { 
        return this.roiAreaLayer();
    }

}

SearchResultLayer.layerName = 'SearchResultLayer';