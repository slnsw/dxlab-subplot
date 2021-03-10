
import { CompositeLayer, SolidPolygonLayer } from 'deck.gl'
import { get } from 'lodash'
import { getYearElevation } from '../../share/utils'

export class MapsPolygonLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    // if (changeFlags.propsChanged === 'props.dataSet changed shallowly') {
    if (changeFlags.dataChanged) {
      const { dataSet: data } = props

      if (!data) {
        return
      }

      const featuresData = data.reduce((result, el) => {
        const { geometry, properties } = el
        if (geometry) {
          result.push({
            geometry,
            properties
          })
        }
        return result
      }, [])

      this.setState({ features: featuresData })
    }
  }

  getMapElevation (year) {
    const { filters } = this.props
    const { fromYear, toYear } = filters
    return getYearElevation({ fromYear, toYear, year, offsetZ: 0 })
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
    const { year } = d.properties
    const opacity = this.isVisible(year) ? maxOpacity : 0
    // console.log(opacity, year, fromYear, toYear)
    return [255, 255, 255, opacity]
  }

  buildLayer () {
    const { features } = this.state
    return new SolidPolygonLayer({
      id: 'shd-layer',
      data: features,
      extruded: false,
      stroked: false,
      getLineWidth: 0,
      material: false,
      castShadow: false,
      pickable: true,

      getPolygon: (d) => {
        const { year } = d.properties
        let coors = d.geometry.coordinates || []
        if (coors) {
          let elevation = this.getMapElevation(year)
          elevation = this.isVisible(year) ? elevation : -1
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
        // getPolygon: [inFocus]

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
