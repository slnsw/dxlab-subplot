
import {CompositeLayer} from 'deck.gl';

import {GeoJsonLayer} from '@deck.gl/layers'; 
    
export class FooprintMapsLayer extends CompositeLayer {


    renderLayers() { 
        return [];
    }

}

FooprintMapsLayer.layerName = 'FooprintMapsLayer';