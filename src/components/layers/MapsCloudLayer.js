
import { CompositeLayer } from 'deck.gl'
import { MosaicBitmapLayer } from './mosaic/MosaicBitmapLayer'
import { GeoJsonLayer } from '@deck.gl/layers'

import { getYearElevation } from '../../share/utils'

export class MapsCloudLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      const { filters } = this.props
      const { fromYear, toYear } = filters

      // Prepare data for loading sprite maps
      const mapSpriteData = data.reduce(function (result, el) {
        const { geometry, properties } = el

        if (geometry) {
          const { year } = properties
          const elevation = getYearElevation({ fromYear, toYear, year })

          result.push({
            bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
            image: properties.asset_id,
            color: [1.0, 0, 0],
            offsetZ: elevation
          })
        }

        return result
      }, [])

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
    const { id, name } = this.props

    const layers = []

    const { mapSpriteData, dummyPolygonData } = this.state

    // Render sprite maps
    const sprites = new MosaicBitmapLayer(this.getSubLayerProps({
      id: `${id}-bitmap-layer-mosaic`,

      data: mapSpriteData,
      imageAtlas: 'sprites/subdivisions_2.png',
      imageMapping: 'sprites/subdivisions_20.json',
      opacity: 0,
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

      parameters: {
        // Prevent png alpha channel create artifacts when overlapping other PNG files
        depthMask: false
      }

    }))

    // Render dummy shadow surfaces
    const dummy = new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-shadow`,
      data: dummyPolygonData,
      extruded: false,
      getLineWidth: 0,
      getFillColor: [255, 255, 255, 0],
      getLineColor: [255, 255, 255, 0],

      parameters: {
        // Prevent png alpha channel create artifacts when overlapping other PNG files
        depthMask: false
      }
    }))

    layers.push(sprites)
    layers.push(dummy)

    return layers
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
