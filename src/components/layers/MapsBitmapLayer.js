
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer } from '@deck.gl/layers';

import { pick } from 'lodash';

export class MapsBitmapLayer extends CompositeLayer {


    buildLayers(data) {
        const { name, suffix } = this.props;

        const layers = data.map((m) => {
            if (m.has_cutline_crop) {
                const bounds = m.bbox_coord.coordinates[0].map((c) => {
                    const elv = 50; // *  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);
                    // console.log(elv, c)
                    c.push(elv);
                    
                    return c;
                  });

                const mData = pick(m, ['year', 'title', 'asset_id'])
                const imageUrl = `${process.env.REACT_APP_STATIC_BASE_URL}/${m.asset_id}${suffix}.png`;
                return new BitmapLayer({
                    id: 'bitmap-layer-' + name + '-' + m.asset_id,
                    bounds: bounds,
                    opacity: 0.8,
                    pickable: true,
                    autoHighlight: true,
                    data: mData,
                    image: imageUrl,
                    onHover: (info) => {
                        this.setState({
                            hoveredObject: info.layer.props.data,
                            pointerX: info.x,
                            pointerY: info.y
                        });
                    }
                });
 
            }

            return null;

        });
        return layers;

    }


    renderLayers() {
        const { data } = this.props;
        return this.buildLayers(data);
    }


}

MapsBitmapLayer.layerName = 'MapsBitmapLayer';

