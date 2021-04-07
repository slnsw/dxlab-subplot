
import { CompositeLayer, SolidPolygonLayer } from 'deck.gl'
import { get, isEmpty } from 'lodash'
import { getYearElevation } from '../../share/utils'

export class MapsPolygonLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    // if (changeFlags.propsChanged === 'props.dataSet changed shallowly') {
    if (changeFlags.dataChanged) {
      const { dataSet: data } = props

      if (!data) {
        return
      }

      // Don't process data if state is complete
      let { features } = this.state

      // Don't process data if not needed
      if (!isEmpty(features)) {
        return
      }

      features = data.reduce((result, el) => {
        const { geometry, properties } = el
        if (geometry) {
          result.push({
            geometry,
            properties
          })
        }
        return result
      }, [])

      this.setState({ features })
    }
  }

  getMapElevation (year, offsetYear) {
    const { filters } = this.props
    const { fromYear, toYear } = filters
    return getYearElevation({ fromYear, toYear, year, offsetZ: (offsetYear * 10) - 0 })
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

  getColor (d, maxOpacity = 125) {
    const { year, asset_id } = d.properties
    let opacity = this.isVisible(year) ? maxOpacity : 0
    opacity = this.inSearchRange(asset_id) ? opacity : 0
    // console.log(opacity, year, fromYear, toYear)
    return [255, 255, 255, 0]
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

  buildLayer () {
    const { features } = this.state
    const { filters, mapContext } = this.props
    const [mapState] = mapContext
    const { near } = mapState

    return new SolidPolygonLayer({
      id: 'shd-layer',
      data: features,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      material: false,
      castShadow: false,
      pickable: true,
      // Don't draw shadows in this layer
      shadowEnabled: false,

      getPolygon: (d) => {
        const { year, asset_id, offsetYear } = d.properties
        let coors = d.geometry.coordinates || []
        if (coors) {
          let elevation = this.getMapElevation(year, offsetYear)
          elevation = this.isVisible(year) ? elevation : -1
          elevation = this.inSearchRange(asset_id) ? elevation : -1
          coors = [coors[0].map((c) => [...c, elevation])]
          // console.log(coors)
        } else {
          return []
        }
        return coors || []
      },
      // getLineColor: (d) => this.getColor(d, 255),
      getFillColor: (d) => this.getColor(d),
      updateTriggers: {
        getPolygon: [filters.fromYear, filters.toYear, near.all]
        // getFillColor: [filters.fromYear, filters.toYear, near.all]

      },
      transitions: {
        getPolygon: 300
        // getFillColor: 300
        // getLineColor: 100
      }
    })
  }

  getPickingInfo (pickParams) {
    // Because we are using all dataset we need to check
    // if the click / hover object is visible
    const obj = get(pickParams, 'info.object', null)
    if (obj !== null) {
      const year = get(obj, 'properties.year', null)
      if (!this.isVisible(year)) {
        pickParams.info.object = {}
      }
    }
    return pickParams.info
  }

  renderLayers () {
    return this.buildLayer()
  }
}

MapsPolygonLayer.layerName = 'MapsPolygonLayer'
