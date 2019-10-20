
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers';
import { getImageUrl } from '../../share/utils'; 

import { pick } from 'lodash';

export class MapsBitmapLayer extends CompositeLayer {


    updateState({props, changeFlags}) {
        if(changeFlags.dataChanged){
            const { data, suffix } = props;

            const featuresData = data.reduce(function(result, m) {
                if (m.has_cutline_crop) {
                    const elevation = 50;
                    const bounds = m.bbox_coord.coordinates[0].map((c) => {
                        //const elv = 50; // *  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);
                        //c.push(elevation);
                        return c;
                    });
    
                    const info = pick(m, ['year', 'title', 'asset_id'])
                    const image = getImageUrl(m.asset_id, suffix);

                    const feature = {
                        type: 'feature',
                        geometry: m.cutline,
                        properties: {   
                            ...info,
                            imageUrl: image,
                            imageBounds : bounds,
                            elevation
                        }
                    }

                    // console.log(feature);
                    result.push(feature);
                }
                return result;
              }, []);

            const feature = { 
                'type': 'FeatureCollection',
                'features': featuresData
    
            }

            this.setState({feature});
        }
    }


    buildLayers() {
        const { id, name } = this.props;
        const { feature : { features } } = this.state; 

        const layers = features.map(({properties: {asset_id, imageBounds, imageUrl}}) => {           
            return new BitmapLayer(this.getSubLayerProps({
                    id: `${id}-bitmap-layer-${name}-${asset_id}`,
                    bounds: imageBounds,
                    opacity: 0.8,
                    pickable: false,
                    autoHighlight: false,
                    image: imageUrl
                }));

        });        

        layers.push(new GeoJsonLayer(this.getSubLayerProps({
            id: `${id}-bitmap-layer-${name}-cutlines`,
            data: this.state.feature,
            pickable: true,
            autoHighlight: true,
            stroked: true,
            getFillColor: [0,0,0,0],
            getLineColor: [0,0,0,125],
        })));




        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsBitmapLayer.layerName = 'MapsBitmapLayer';

