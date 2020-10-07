
import { CompositeLayer } from 'deck.gl'
import { SpriteBitmapLayer } from './mosaic/SpriteBitmapLayer'
import { GeoJsonLayer } from '@deck.gl/layers'

import { getYearElevation } from '../../share/utils/helpers'

import { sortBy, get } from 'lodash'

export class MapsCloudLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      const { filters } = this.props
      const { fromYear, toYear } = filters

      // Prepare data for loading sprite maps and sort by offsetZ.
      // Sorting by offsetZ is important because SpriteBitmapLayer internally
      // disable depthMask to remove artifacts created by overlapping two PNG
      // with transparency and the zFighting.
      const mapSpriteData = sortBy(data.reduce(function (result, el) {
        const { geometry, properties } = el

        if (geometry) {
          const { year } = properties
          const elevation = getYearElevation({ fromYear, toYear, year }) + 1

          result.push({
            bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
            image: properties.asset_id,
            color: [1.0, 0, 0],
            offsetZ: elevation,
            opacity: 1
          })
        }

        return result
      }, []), ['offsetZ'])

      // `${process.env.REACT_APP_SPRITE_MAPING_PATH}`
      // ()['/sprites/subdivisions_']

      // fetch(`${process.env.REACT_APP_SPRITE_MAPING_PATH}`)
      // // We get the API response and receive data in JSON format...
      // .then(response => response.json())

      const dummyPolygonData = data.reduce(function (result, el) {
        const { geometry, properties } = el
        if (geometry) {
          const { year } = properties
          const elevation = getYearElevation({ fromYear, toYear, year, offsetZ: 0 })

          const feature = {
            ...el,
            geometry: {
              ...geometry,
              coordinates: [geometry.coordinates[0].map((c) => ([...c, elevation]))]
            }
          }
          result.push(feature)
        }
        return result
      }, [])

      this.setState({ mapSpriteData, dummyPolygonData })
    }
  }

  buildLayers () {
    const { id } = this.props

    const layers = []
    const { mapSpriteData, dummyPolygonData } = this.state
    const { uiContext } = this.props

    // TODO: Decouple this context from this layer. Option inject focus via props
    const [uiState] = uiContext
    const inFocus = get(uiState, 'focus.properties.asset_id', null)
    const isIdle = get(uiState, 'isIdle', false)

    // Render sprite maps
    const sprites = new SpriteBitmapLayer(this.getSubLayerProps({
      id: `${id}-sprite-bitmap-layer`,

      data: mapSpriteData,
      // imageAtlas: 'sprites/128/subdivisions_0.png',
      // imageMapping: 'sprites/128/subdivisions_0.json',
      sprites: 5,
      path: 'sprites/256/',
      // prefix: 'subdivisions_',
      pickable: false,
      autoHighlight: false,

      getOpacity: d => {
        if (inFocus !== null && !isIdle) {
          return (d.image === inFocus) ? 1 : 0.5
        } else {
          return 1
        }
      },
      // getOffsetZ: d => {
      //   if (inFocus !== null) {
      //     return (d.image === inFocus) ? d.offsetZ : 0
      //   } else {
      //     return d.offsetZ
      //   }
      // },

      // This layer don't cast shadows
      castShadow: false,
      // Ignore material in lighting effect
      material: false,
      // Don't draw shadows in this layer
      shadowEnabled: false,
      updateTriggers: {
        getOpacity: [inFocus, isIdle]
        // getOffsetZ: [inFocus]
      },
      transitions: {
        getColor: 800
        // getOffsetZ: 500
      }

    }))

    // Render dummy shadow surfaces
    const shadows = new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-shadow`,
      data: dummyPolygonData,
      extruded: false,
      getLineWidth: 0,
      getFillColor: [255, 255, 255, 0],
      getLineColor: [255, 255, 255, 0]

    }))

    layers.push(sprites)
    layers.push(shadows)

    return layers
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
