
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer } from '@deck.gl/layers';

import { pick } from 'lodash';

export class MapsBitmapLayer extends CompositeLayer {


    updateState({props, changeFlags}) {
        if(changeFlags.dataChanged){
            const { data, suffix } = props;

            const bitmapData = data.reduce(function(result, m) {
                if (m.has_cutline_crop) {
                    const bounds = m.bbox_coord.coordinates[0].map((c) => {
                        const elv = 50; // *  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);
                        c.push(elv);
                        return c;
                      });
    
                    const info = pick(m, ['year', 'title', 'asset_id'])
                    const imageUrl = `${process.env.REACT_APP_STATIC_BASE_URL}/${m.asset_id}${suffix}.png`;

                    result.push({
                        bounds,
                        info,
                        imageUrl
                    });
                }
                return result;
              }, []);

            this.setState({bitmapData});
        }
    }


    buildLayers() {
        const { id, name } = this.props;
        const { bitmapData } = this.state; 

        const layers = bitmapData.map(({bounds, info, imageUrl}) => {
                return new BitmapLayer({
                    id: `${id}-bitmap-layer-${name}-${info.asset_id}`,
                    bounds: bounds,
                    opacity: 0.8,
                    pickable: true,
                    autoHighlight: true,
                    data: info,
                    image: imageUrl,
                    onHover: (info) => {
                        this.setState({
                            hoveredObject: info.layer.props.data,
                            pointerX: info.x,
                            pointerY: info.y
                        });
                    }
                });

        });
        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsBitmapLayer.layerName = 'MapsBitmapLayer';

