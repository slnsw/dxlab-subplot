
import { CompositeLayer, SolidPolygonLayer } from 'deck.gl'
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
      let elevationOffset = 0
      // Prepare data for loading sprite maps and sort by offsetZ.
      // Sorting by offsetZ is important because SpriteBitmapLayer internally
      // disable depthMask to remove artifacts created by overlapping two PNG
      // with transparency and the zFighting.
      const mapSpriteData = sortBy(data.reduce(function (result, el) {
        const { geometry, properties } = el

        if (geometry) {
          elevationOffset = elevationOffset + 0.01
          const { year } = properties
          const elevation = getYearElevation({ fromYear, toYear, year }) + (1 + elevationOffset)
          // const elevation = 0

          result.push({
            bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
            image: properties.asset_id,
            color: [1.0, 0, 0],
            offsetZ: elevation,
            opacity: 1,
            year
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

      // const dummyPolygonData = data.reduce((result, el) => {
      //   const { geometry, properties } = el
      //   if (geometry) {
      //     result.push({
      //       geometry,
      //       properties
      //     })
      //   }
      //   return result
      // }, [])

      this.setState({ mapSpriteData, dummyPolygonData })
    }
  }

  getMapElevation (year) {
    const { filters, mapContext } = this.props
    // const [mapState] = mapContext
    // const { meta } = mapState
    // const {}
    // console.log(meta)
    const { fromYear, toYear } = filters
    return getYearElevation({ fromYear, toYear, year, offsetZ: 0 })
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
      sprites: process.env.REACT_APP_SPRITE_COUNT, // 5,
      path: process.env.REACT_APP_SPRITE_PATH, // 'sprites/256/',
      // prefix: 'subdivisions_',
      pickable: false,
      autoHighlight: false,

      getOpacity: d => {
        const { filters } = this.props
        const { fromYear, toYear } = filters
        const { year } = d
        const opacity = (year >= fromYear && year <= toYear) ? 1 : 0
        // console.log(opacity, year, fromYear, toYear)
        return opacity
      },
      getOffsetZ: d => {
        const { filters } = this.props
        const { fromYear, toYear } = filters

        const { year, bounds } = d
        const coors = bounds || []
        let elevation = 0
        if (coors) {
          elevation = this.getMapElevation(year)
          elevation = (year >= fromYear && year <= toYear) ? elevation : 0
          // console.log(coors)
        } else {
          return 0
        }
        return elevation
      },

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
        getColor: 800,
        getOffsetZ: 300,
        getOpacity: 300
      }

    }))

    // Render dummy shadow surfaces
    const shadows = new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-shadow`,
      data: dummyPolygonData,
      extruded: false,
      getLineWidth: 0,
      stroke: false,
      getFillColor: [255, 255, 255, 0],
      getLineColor: [255, 255, 255, 0]

    }))

    layers.push(sprites)
    // layers.push(this.buildShadows())
    layers.push(shadows)

    return layers
  }

  // getMapElevation (year) {
  //   const { filters, mapContext } = this.props
  //   // const [mapState] = mapContext
  //   // const { meta } = mapState
  //   // const {}
  //   // console.log(meta)
  //   const { fromYear, toYear } = filters
  //   return getYearElevation({ fromYear, toYear, year, offsetZ: 0 })
  // }

  getShadowColor (d, maxOpacity = 125) {
    const { filters } = this.props
    const { fromYear, toYear } = filters
    const { year } = d.properties
    const opacity = (year >= fromYear && year <= toYear) ? maxOpacity : 0
    // console.log(opacity, year, fromYear, toYear)
    return [255, 255, 255, opacity]
  }

  buildShadows () {
    const { dummyPolygonData } = this.state
    return new SolidPolygonLayer({
      // id: 'footprint-layer',
      data: dummyPolygonData,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      // material: false,
      castShadow: true,

      getPolygon: (d) => {
        const { filters } = this.props
        const { fromYear, toYear } = filters

        const { year } = d.properties
        let coors = d.geometry.coordinates || []
        if (coors) {
          let elevation = this.getMapElevation(year)
          elevation = (year >= fromYear && year <= toYear) ? elevation : -1
          coors = [coors[0].map((c) => [...c, elevation])]
          // console.log(coors)
        } else {
          return []
        }
        return coors || []
      },
      // getLineColor: (d) => this.getColor(d, 255),
      getFillColor: (d) => this.getShadowColor(d, 0),
      updateTriggers: {
        // getPolygon: [inFocus]

      },
      transitions: {
        getPolygon: 300,
        getFillColor: 300
        // getLineColor: 100
      }
    })
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
