
import { CompositeLayer } from 'deck.gl';
import { TextLayer, IconLayer } from '@deck.gl/layers';
import Supercluster from 'supercluster';

const ICON_MAPPING = {
    "marker-1": {
      "x": 0,
      "y": 0,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-2": {
      "x": 128,
      "y": 0,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-3": {
      "x": 256,
      "y": 0,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-4": {
      "x": 384,
      "y": 0,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-5": {
      "x": 0,
      "y": 128,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-6": {
      "x": 128,
      "y": 128,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-7": {
      "x": 256,
      "y": 128,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-8": {
      "x": 384,
      "y": 128,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-9": {
      "x": 0,
      "y": 256,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-10": {
      "x": 128,
      "y": 256,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-20": {
      "x": 256,
      "y": 256,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-30": {
      "x": 384,
      "y": 256,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-40": {
      "x": 0,
      "y": 384,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-50": {
      "x": 128,
      "y": 384,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-60": {
      "x": 256,
      "y": 384,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-70": {
      "x": 384,
      "y": 384,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-80": {
      "x": 0,
      "y": 512,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-90": {
      "x": 128,
      "y": 512,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker-100": {
      "x": 256,
      "y": 512,
      "width": 128,
      "height": 128,
      "anchorY": 128
    },
    "marker": {
      "x": 384,
      "y": 512,
      "width": 128,
      "height": 128,
      "anchorY": 128
    }
  }

  function getIconName(size) {
    if (size === 0) {
      return '';
    }
    if (size < 10) {
      return `marker-${size}`;
    }
    if (size < 100) {
      return `marker-${Math.floor(size / 10)}0`;
    }
    return 'marker-100';
  }
  
  function getIconSize(size) {
    return Math.min(100, size) / 100 + 1;
  }
  
export class MapsClusterCounts extends CompositeLayer {


    shouldUpdateState({changeFlags}) {
        return changeFlags.somethingChanged;

      }
    

    updateState({ props, changeFlags }) {
        const { data } = props;
        if (!data) {
            return;
        }

        if (changeFlags.dataChanged) {
            const index = new Supercluster({ maxZoom: 16, radius: 60 });

            index.load(
                data.map(({ properties }) => ({
                    geometry: properties.centroid,
                    properties
                }))
            );
            
            this.setState({ index });
        }

        const zoom = Math.floor(this.context.viewport.zoom);

        if(this.state.zoom !== zoom) {
            const cluster = this.state.index.getClusters([-180, -85, 180, 85], zoom);
            this.setState({ cluster, zoom });
        }
    }


    buildLayers() {
        const { id, name } = this.props;
        const { cluster } = this.state;

        const layers = [];

        layers.push(new IconLayer(this.getSubLayerProps({
            id: `${id}-layer-${name}-icon-cluster-count`,
            data: cluster,
            iconAtlas: 'location-icon-atlas.png',
            iconMapping: ICON_MAPPING,
            sizeScale: 60,
            getPosition: d => d.geometry.coordinates,
            getIcon: d => 'marker', // getIconName(d.properties.cluster ? d.properties.point_count : 1),
            getSize: d => getIconSize(d.properties.cluster ? d.properties.point_count : 1)
        })));

        layers.push(new TextLayer(this.getSubLayerProps({
            id: `${id}-layer-${name}-label-cluster-count`,
            data: cluster,
            pickable: false,
            billboard: true,
            fontFamily: 'Roboto Slab',
            getPixelOffset: d => {
                const size = getIconSize(d.properties.cluster ? d.properties.point_count : 1);
                
                return [0, -(64 / (2 / size))];
            } ,
            getTextAnchor: 'middle',

            // autoHighlight: true,
            getText: d =>String(d.properties.cluster ? d.properties.point_count : 1),
            getPosition: d => d.geometry.coordinates,
        })));

        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsClusterCounts.layerName = 'MapsClusterCounts';

