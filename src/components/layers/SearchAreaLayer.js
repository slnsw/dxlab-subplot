
import { CompositeLayer } from 'deck.gl'
import { GeoJsonLayer } from '@deck.gl/layers'
import circle from '@turf/circle'

export class SearchAreaLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.propsChanged) {
      const { mapContext = [] } = props
      const [mapState = {}] = mapContext
      const { near = {} } = mapState
      const { radius = 0, center = {} } = near
      this.setState({ radius, center })
    }
  }

  getGeoJsonSydneyArea () {
    const { center, radius } = this.state
    return {
      type: 'FeatureCollection',
      features: [
        circle(center, radius)
      ]
    }
  }

  renderLayers () {
    const { radius } = this.state
    if (radius > 0) {
      return new GeoJsonLayer({
        id: 'roi-radius-area',
        data: this.getGeoJsonSydneyArea(),
        // Transparent we are using this polygon only ask shadow projection
        getFillColor: [255, 255, 255, 50]
      })
    }
  }
}

SearchAreaLayer.layerName = 'SearchAreaLayer'
