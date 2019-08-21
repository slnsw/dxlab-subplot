
import { CompositeLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';

// Temp
import { MapDataService } from '../../share/services'



export class FootprintMapsLayer extends CompositeLayer {

    mapPoints() {
        const service = new MapDataService();
        const data = service.getFootprint(this.props.data);

        return new PolygonLayer({
            id: 'footprint-layer',
            data: data,
            extruded: false,
            stroked: false,
            getLineWidth: 0,
            getPolygon: (d) => d,
            getFillColor: (d) => {
                // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);
                return [0, 0, 0, 100];
            },
        });

    }



    renderLayers() {
        return [this.mapPoints()];
    }


}

FootprintMapsLayer.layerName = 'FootprintMapsLayer';