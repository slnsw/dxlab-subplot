
import { CompositeLayer } from 'deck.gl'
import { TextLayer } from '@deck.gl/layers'

export class MapsLabelLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      const feature = {
        type: 'FeatureCollection',
        features: data

      }

      this.setState({ feature })
    }
  }

  buildLayers () {
    const { id, name } = this.props
    const { feature: { features } } = this.state

    const layers = []

    layers.push(new TextLayer(this.getSubLayerProps({
      id: `${id}-layer-${name}-label`,
      data: features,
      pickable: false,
      billboard: false,
      fontFamily: 'Lekton',
      getPixelOffset: [0, 0],
      getColor: [255, 255, 255, 125],

      // autoHighlight: true,
      getText: d => String(d.properties.year),
      getPosition: d => {
        const c = d.properties.centroid.coordinates
        c.push(0)
        return c
      }
    })))

    return layers
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsLabelLayer.layerName = 'MapsLabelLayer'