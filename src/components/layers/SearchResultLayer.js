
import {CompositeLayer} from 'deck.gl';
import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class SearchResultLayer extends CompositeLayer {


    searchAreaLayer() {
        const {id, filter} = this.props;
        if (!filter) {
            return ;
        }
        const {aroundRadius, around} = filter;

        return new GeoJsonLayer({
            id: `${id}-roi-area`,
            data:  around,
            getFillColor: [0, 0, 0, 30],
            getRadius: (d) => { 
                return aroundRadius; 
            },
            // pointRadiusMinPixels: 10,
            // pointRadiusMaxPixels: 10
          });
    }
    
 
    
    renderLayers() { 
        return this.searchAreaLayer();
    }

}

SearchResultLayer.layerName = 'SearchResultLayer';