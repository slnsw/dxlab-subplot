
import { CompositeLayer } from 'deck.gl'
import { PolygonLayer } from '@deck.gl/layers'

import { MergeGeoJsonPolygon } from '../../share/utils/geospatial'

export class FootprintMapsLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }
      // Only merge cutlines polygon data
      const cutlines = data.map(({ geometry }) => geometry)

      // Merge polygons
      const merge = new MergeGeoJsonPolygon()
      merge.setData(cutlines)

      // Get only coordinates
      const footprintData = merge.getCoordinates()
      this.setState({ footprintData })
    }
  }

  footprintLayer () {
    const { id } = this.props
    const { footprintData } = this.state

    return new PolygonLayer({
      id: `${id}-footprint-layer`,
      data: footprintData,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      material: false,
      getPolygon: (d) => d,
      getFillColor: (d) => [0, 0, 0, 150]
    })
  }

  renderLayers () {
    return [this.footprintLayer()]
  }
}

FootprintMapsLayer.layerName = 'FootprintMapsLayer'