
import {CompositeLayer} from 'deck.gl';

import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class SearchResultLayer extends CompositeLayer {


    roiAreaLayer() {
        return new GeoJsonLayer({
            id: "roi-area",
            data:  this.props.data,
            getFillColor: [0, 0, 0, 50],
            getRadius: (d) => { 
                const {properties:{zoom}} = d; 
                return 2000; //+ (500 * ( 20 - zoom)); // * (20 - zoom); 
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