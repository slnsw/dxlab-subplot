
import { CompositeLayer } from 'deck.gl';
import { TextLayer } from '@deck.gl/layers';
import { pick } from 'lodash';

export class MapsLabelLayer extends CompositeLayer {


    updateState({props, changeFlags}) {
        if(changeFlags.dataChanged){
            const { data } = props;

            const featuresData = data.reduce(function(result, m) {
                if (m.has_cutline_crop) {

                    const info = pick(m, ['year', 'title', 'asset_id'])
                    const feature = {
                        type: 'feature',
                        geometry: m.cutline,
                        properties: {   
                            ...info,
                            centroid: m.cutline_centroid
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

        const layers = [];

        layers.push(new TextLayer(this.getSubLayerProps({
            id: `${id}-layer-${name}-label`,
            data: features,
            pickable: true,
            billboard: false,
            fontFamily: 'Roboto Slab',
            getPixelOffset: [0, 0],

            // autoHighlight: true,
            getText: d => String(d.properties.year),
            getPosition: d => {
                let c = d.properties.centroid.coordinates;
                c.push(0);
                return c;
            },
        })));
        

        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsLabelLayer.layerName = 'MapsLabelLayer';

