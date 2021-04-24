
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
          const { year, asset_id, offsetYear } = properties

          result.push({
            bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
            image: properties.asset_id,
            color: [1.0, 0, 0],
            offsetZ: offsetYear * 10,
            opacity: 1,
            year,
            asset_id,
            geojson: {
              geometry, properties
            }
          })
        }

        return result
      }, []), ['year', 'asset_id'])

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

  getMapElevation (year, offsetZ) {
    const { filters } = this.props

    const { fromYear, toYear } = filters
    const elevation = getYearElevation({ fromYear, toYear, year, offsetZ: offsetZ })

    return elevation
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

  handleAllSpriteLoaded () {
    this.setState({ spritesLoaded: true })
    const { onAllSpritesLoaded } = this.props
    if (onAllSpritesLoaded) {
      onAllSpritesLoaded()
    }
  }

  handleSpriteLoaded ({ ...args }) {
    const { onSpriteLoaded } = this.props
    if (onSpriteLoaded) {
      onSpriteLoaded(args)
    }
  }

  buildSprites () {
    const { id, filters } = this.props
    const { mapSpriteData } = this.state
    const { mapContext, uiContext } = this.props

    // TODO: Decouple this context from this layer. Option inject focus via props
    const [uiState] = uiContext
    const inFocus = get(uiState, 'focus.properties.asset_id', null)
    const isIdle = get(uiState, 'isIdle', false)
    const selected = get(uiState, 'selected.properties.asset_id', null)
    const selectedOpacity = get(uiState, 'selectedOpacity', 1)

    const [mapState] = mapContext
    const { near } = mapState

    // Render sprite maps
    const sprites = new SpriteBitmapLayer({
      id: `${id}-sprite-bitmap-layer`,
      data: mapSpriteData,
      sprites: process.env.REACT_APP_SPRITE_COUNT,
      path: process.env.REACT_APP_SPRITE_PATH,
      pickable: true,
      autoHighlight: false,
      onAllSpriteLoaded: this.handleAllSpriteLoaded.bind(this),
      onSpriteLoaded: this.handleSpriteLoaded.bind(this),

      getOpacity: d => {
        const { year, asset_id } = d
        let opacity = this.isVisible(year) ? 1 : 0
        // console.log(opacity, year, fromYear, toYear)
        // Is visible check if inFocus
        if (opacity !== 0 && inFocus !== null && !isIdle) {
          opacity = (d.image === inFocus) ? opacity : 0.4
        }

        // Search if in search range
        opacity = this.inSearchRange(asset_id) ? opacity : 0

        if (selected) {
          opacity = (selected === asset_id) ? selectedOpacity : 0
        }

        return opacity
      },
      getOffsetZ: d => {
        const { year, bounds, asset_id, offsetZ } = d
        const coors = bounds || []
        let elevation = 0
        if (coors) {
          elevation = this.getMapElevation(year, offsetZ)
          elevation = this.isVisible(year) ? elevation : 0
          elevation = this.inSearchRange(asset_id) ? elevation : 0
          if (selected) {
            elevation = 0
          }
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
        getOpacity: [inFocus, isIdle, filters.fromYear, filters.toYear, near.all, selected, selectedOpacity],
        getOffsetZ: [filters.fromYear, filters.toYear, near.all, selected]
      },
      transitions: {
        // getColor: 800,
        getOffsetZ: 300,
        getOpacity: 300
      }

    })
    return sprites
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
    const { filters, mapContext, uiContext } = this.props
    const [mapState] = mapContext
    const { near } = mapState

    const [uiState] = uiContext
    const selected = get(uiState, 'selected.properties.asset_id', null)

    return new SolidPolygonLayer({
      id: 'shadow-layer',
      data: dummyPolygonData,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      material: false,
      castShadow: false,

      getPolygon: (d) => {
        const { year, asset_id, offsetYear } = d.properties
        let coors = d.geometry.coordinates || []
        if (coors) {
          let elevation = this.getMapElevation(year, (offsetYear * 10) + 10)
          elevation = this.isVisible(year) ? elevation : -1
          elevation = this.inSearchRange(asset_id) ? elevation : -1
          if (selected) {
            elevation = -1
          }

          coors = [coors[0].map((c) => [...c, elevation])]
        } else {
          return []
        }
        return coors
      },
      // getLineColor: (d) => this.getColor(d, 255),
      getFillColor: (d) => this.getShadowColor(d, 0),
      updateTriggers: {
        getPolygon: [filters.fromYear, filters.toYear, near.all, selected],
        getFillColor: [filters.fromYear, filters.toYear, near.all, selected]
      },
      transitions: {
        getPolygon: 300,
        getFillColor: 300
        // getLineColor: 100
      }
    })
  }

  getPickingInfo (pickParams) {
    // Because we are using all dataset we need to check
    // if the click / hover object is visible
    const obj = get(pickParams, 'info.object.geojson', null)

    if (obj !== null) {
      const year = get(obj, 'properties.year', null)
      if (!this.isVisible(year)) {
        pickParams.info.object = {}
      } else {
        pickParams.info.object = obj
      }
    }
    return pickParams.info
  }

  renderLayers () {
    const { spritesLoaded = false } = this.state
    return [
      this.buildSprites(),
      ...((spritesLoaded) ? [this.buildShadows()] : [])
    ]
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
