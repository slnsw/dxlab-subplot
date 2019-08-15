
import {CompositeLayer} from 'deck.gl';

import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class SearchResultLayer extends CompositeLayer {


    searchResultLayer() {
        return new GeoJsonLayer({
            id: "search-result",
            data:  this.props.data,
            getFillColor: [255, 0, 0, 128],
            getRadius: 1000,
            pointRadiusMinPixels: 10,
            pointRadiusMaxPixels: 10
          });
    }
    
 
    
    renderLayers() { 
        return this.searchResultLayer();
    }

}

SearchResultLayer.layerName = 'SearchResultLayer';