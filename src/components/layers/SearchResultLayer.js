
import {CompositeLayer} from 'deck.gl';
import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class SearchResultLayer extends CompositeLayer {


    roiAreaLayer() {
        const {id, contextState: {maps}} = this.props;
        const {aroundRadius, around} = maps;
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
        return this.roiAreaLayer();
    }

}

SearchResultLayer.layerName = 'SearchResultLayer';