
import { CompositeLayer } from 'deck.gl'
import { GeoJsonLayer } from '@deck.gl/layers'

export class FootprintShadowLayer extends CompositeLayer {
  /**
   * Return an GeoJSON of all sydney area.
   * This layer only is use to get a shadow projection
   * of current selected maps.
   */
  getGeoJsonSydneyArea () {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  149.35638427734375,
                  -34.838604318634985
                ],
                [
                  151.95465087890625,
                  -34.838604318634985
                ],
                [
                  151.95465087890625,
                  -32.91879097277369
                ],
                [
                  149.35638427734375,
                  -32.91879097277369
                ],
                [
                  149.35638427734375,
                  -34.838604318634985
                ]
              ]
            ]
          }
        }
      ]
    }
  }

  renderLayers () {
    return new GeoJsonLayer({
      id: 'roi-area',
      data: this.getGeoJsonSydneyArea(),
      // Transparent we are using this polygon only ask shadow projection
      getFillColor: [0, 0, 0, 0]
    })
  }
}

FootprintShadowLayer.layerName = 'FootprintShadowLayer'
