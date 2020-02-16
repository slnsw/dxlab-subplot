
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers';
import { getImageUrl } from '../../share/utils';
import { load } from "@loaders.gl/core";

export class MapsBitmapLayer extends CompositeLayer {


    updateState({ props, changeFlags }) {
        if (changeFlags.dataChanged) {
            const { data, suffix } = props;

            if (!data) {
                return;
            }
            
            const featuresData = data.reduce(function (result, el) {
                const { geometry, properties } = el;
                if (geometry) {
                    const elevation = 50;
                    //  const { filter} = this.props;
                    //  const { fromYear, toYear } = filter;
                    //  const elevation = interpolateScale(parseInt(m.year), toYear, fromYear) * 50; 
                    //  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);

                    const image = getImageUrl(properties.asset_id, suffix, '128');

                    const feature = {
                        ...el,
                        geometry: {
                            ...geometry,
                            coordinates: [geometry.coordinates[0].map((c) => {
                                c.push(elevation);
                                return c;
                            })]
                        },
                        properties: {
                            ...properties,
                            elevation,
                            image_url: load(image),
                            // IMPORTANT: Change image bound structure to a single array
                            // Deck.gl API needs image bounds in a single array. 
                            image_bounds: properties.image_bounds.coordinates[0].map((c) => {
                                c.push(elevation);
                                return c;
                            }),

                        }
                    }

                    result.push(feature);
                }
                return result;
            }, []);

            const feature = {
                'type': 'FeatureCollection',
                'features': featuresData

            }
            this.setState({ feature });

        }
    }


    buildLayers() {
        const { id, name } = this.props;
        const { feature: { features } } = this.state;
        const layers = [];

        layers.push(features.map(({properties: {asset_id, image_bounds, image_url}}) => {   
            return new BitmapLayer(this.getSubLayerProps({
                    id: `${id}-bitmap-layer-${name}-${asset_id}`,
                    bounds: image_bounds,
                    opacity: 0.8,
                    pickable: false,
                    autoHighlight: false,
                    image: image_url
                }));

        }));        

        layers.push(new GeoJsonLayer(this.getSubLayerProps({
            id: `${id}-bitmap-layer-${name}-cutlines`,
            data: this.state.feature,
            pickable: true,
            autoHighlight: true,
            stroked: true,
            getFillColor: [0, 0, 0, 0],
            getLineColor: [0, 0, 0, 125],
            
        })));

        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsBitmapLayer.layerName = 'MapsBitmapLayer';

