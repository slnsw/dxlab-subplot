
import { CompositeLayer } from 'deck.gl'
import { MosaicBitmapLayer } from './mosaic/MosaicBitmapLayer'
import { GeoJsonLayer } from '@deck.gl/layers'

import { getYearElevation } from '../../share/utils'

import { sortBy } from 'lodash'

export class MapsCloudLayer extends CompositeLayer {
  updateState({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      const { filters } = this.props
      const { fromYear, toYear } = filters

      // Prepare data for loading sprite maps and sort by offsetZ.
      // Sorting by offsetZ is important because MosaicBitmapLayer internally
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

  buildLayers() {
    const { id } = this.props

    const layers = []

    const { mapSpriteData, dummyPolygonData } = this.state

    // Render sprite maps
    const sprites = new MosaicBitmapLayer(this.getSubLayerProps({
      id: `${id}-bitmap-layer-mosaic`,

      data: mapSpriteData,
      imageAtlas: 'sprites/128/subdivisions_0.png',
      imageMapping: 'sprites/128/subdivisions_0.json',
      pickable: false,
      autoHighlight: false,

      // opacity: 0,
      // imageAtlas: [
      //     'sprites/subdivisions_0.png',
      //     'sprites/subdivisions_1.png'
      // ],
      // imageMapping: [
      //     'sprites/subdivisions_0.json',
      //     'sprites/subdivisions_1.json'
      // ],

      // getOpacity: d => Math.random() * (1 - 0.5) + 0.5,
      // getOffsetZ: 0, // d => Math.random() * (500 - 0) + 0,

      // This layer don't cast shadows
      castShadow: false,
      // Ignore material in lighting effect
      material: false,
      // Don't draw shadows in this layer
      shadowEnabled: false,

    }))

    // Render dummy shadow surfaces
    const shadows = new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-shadow`,
      data: dummyPolygonData,
      extruded: false,
      getLineWidth: 0,
      getFillColor: [255, 255, 255, 0],
      getLineColor: [255, 255, 255, 0],

    }))

    layers.push(sprites)
    layers.push(shadows)

    return layers
  }

  renderLayers() {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
