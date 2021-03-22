
import { CompositeLayer, SolidPolygonLayer } from 'deck.gl'
import { SpriteBitmapLayer } from './mosaic/SpriteBitmapLayer'

import { getYearElevation } from '../../share/utils/helpers'

import { sortBy, get, isEmpty } from 'lodash'

export class MapsCloudLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { dataSet: data } = props

      if (!data) {
        return
      }

      // Don't process data if state is complete
      let { mapSpriteData, dummyPolygonData } = this.state

      // Don't process data if not needed
      if (!isEmpty(mapSpriteData) && !isEmpty(dummyPolygonData)) {
        return
      }

      // const { filters } = this.props
      // const { fromYear, toYear } = filters
      // const elevationOffset = 0
      // Prepare data for loading sprite maps and sort by offsetZ.
      // Sorting by offsetZ is important because SpriteBitmapLayer internally
      // disable depthMask to remove artifacts created by overlapping two PNG
      // with transparency and the zFighting.
      mapSpriteData = sortBy(data.reduce(function (result, el) {
        const { geometry, properties } = el

        if (geometry) {
          const { year, asset_id } = properties
          // elevationOffset = elevationOffset + 0.01

          // const elevation = getYearElevation({ fromYear, toYear, year }) + (1 + elevationOffset)
          const elevation = 0

          result.push({
            bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
            image: properties.asset_id,
            color: [1.0, 0, 0],
            offsetZ: elevation,
            opacity: 1,
            year,
            asset_id
          })
        }

        return result
      }, []), ['year'])

      // Process polygons for shadows
      dummyPolygonData = data.reduce((result, el) => {
        const { geometry, properties } = el
        if (geometry) {
          result.push({
            geometry,
            properties
          })
        }
        return result
      }, [])

      this.setState({
        mapSpriteData,
        dummyPolygonData
      })
    }
  }

  getMapElevation (year) {
    const { filters } = this.props
    // const [mapState] = mapContext
    // const { meta } = mapState
    // const {}
    // console.log(meta)
    const { fromYear, toYear } = filters
    return getYearElevation({ fromYear, toYear, year, offsetZ: 2 })
  }

  isVisible (year) {
    if (year) {
      const { filters } = this.props
      const { fromYear, toYear } = filters
      return (year >= fromYear && year <= toYear)
    } else {
      return false
    }
  }

  // Duplicated code
  inSearchRange (asset_id) {
    const { mapContext } = this.props
    const [mapState] = mapContext
    const { near } = mapState
    if (!isEmpty(near)) {
      const { all: { ids = [] } = {} } = near
      return ids.includes(asset_id)
    }
    // There is not active search so return is visible
    return true
  }

  buildLayers () {
    const { id, filters } = this.props

    const layers = []
    const { mapSpriteData } = this.state
    const { mapContext, uiContext } = this.props

    // TODO: Decouple this context from this layer. Option inject focus via props
    const [uiState] = uiContext
    const inFocus = get(uiState, 'focus.properties.asset_id', null)
    const isIdle = get(uiState, 'isIdle', false)

    const [mapState] = mapContext
    const { near } = mapState

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
        const { year, asset_id } = d
        let opacity = this.isVisible(year) ? 1 : 0
        // console.log(opacity, year, fromYear, toYear)
        // Is visible check if inFocus
        if (opacity !== 0 && inFocus !== null && !isIdle) {
          opacity = (d.image === inFocus) ? opacity : 0.5
        }

        // Search if in search range
        opacity = this.inSearchRange(asset_id) ? opacity : 0

        return opacity
      },
      getOffsetZ: d => {
        const { year, bounds, asset_id } = d
        const coors = bounds || []
        let elevation = 0
        if (coors) {
          elevation = this.getMapElevation(year)
          elevation = this.isVisible(year) ? elevation : 0
          elevation = this.inSearchRange(asset_id) ? elevation : 0
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
        getOpacity: [inFocus, isIdle, filters.fromYear, filters.toYear, near.all],
        getOffsetZ: [filters.fromYear, filters.toYear, near.all]
      },
      transitions: {
        // getColor: 800,
        getOffsetZ: 300,
        getOpacity: 300
      }

    }))

    layers.push(sprites)
    layers.push(this.buildShadows())
    // layers.push(shadows)

    return layers
  }

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
    const { filters, mapContext } = this.props
    const [mapState] = mapContext
    const { near } = mapState

    return new SolidPolygonLayer({
      // id: 'footprint-layer',
      data: dummyPolygonData,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      material: false,
      castShadow: false,

      getPolygon: (d) => {
        const { year, asset_id } = d.properties
        let coors = d.geometry.coordinates || []
        if (coors) {
          let elevation = this.getMapElevation(year)
          elevation = this.isVisible(year) ? elevation : -1
          elevation = this.inSearchRange(asset_id) ? elevation : -1
          coors = [coors[0].map((c) => [...c, elevation])]
        } else {
          return []
        }
        return coors || []
      },
      // getLineColor: (d) => this.getColor(d, 255),
      getFillColor: (d) => this.getShadowColor(d, 0),
      updateTriggers: {
        getPolygon: [filters.fromYear, filters.toYear, near.all]
      },
      transitions: {
        getPolygon: 300
        // getFillColor: 300
        // getLineColor: 100
      }
    })
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
