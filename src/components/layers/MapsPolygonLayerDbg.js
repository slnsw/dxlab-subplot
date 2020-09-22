
import { CompositeLayer } from 'deck.gl'
import { GeoJsonLayer } from '@deck.gl/layers'
import { scaleLinear } from 'd3-scale'
import { color } from 'd3-color'

import { get } from 'lodash'

export class MapsPolygonLayerDbg extends CompositeLayer {
  // state = {
  //     elev: 0
  // }

  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      const feature = {
        type: 'FeatureCollection',
        features: data

      }

      this.setState({ feature, elev: 0 })
    }
  }

  buildLayer () {
    const { id, filters, mapContext } = this.props
    const { fromYear, toYear } = filters
    const yearColorScale = scaleLinear([fromYear, toYear], ['gold', 'limegreen'])

    const { elev } = this.state

    const [mapState] = mapContext
    const inFocus = get(mapState, 'focus.properties.asset_id', null)

    return new GeoJsonLayer({
      id: `${id}-maps-polygon-layer`,
      data: this.state.feature,
      extruded: true,
      stroked: true,
      pickable: true,
      autoHighlight: true,
      getLineWidth: 1,
      getFillColor: (d) => {
        // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);

        // reduce opacity to polygons are not in focus
        const asset_id = get(d, 'properties.asset_id', null)
        let opacity = 255
        if (inFocus) {
          opacity = (asset_id && (inFocus === asset_id)) ? 255 : 50
        }

        let c = color(yearColorScale(d.properties.year))
        if (c) {
          c = [c.r, c.g, c.b, opacity]
        }
        return c
      },
      getElevation: (d) => d.properties.year * elev,
      updateTriggers: {
        getFillColor: [inFocus]
      },
      transitions: {
        getFillColor: 300
        // getElevation: 600,
        // getFillColor: {
        //   duration: 300,
        //   easing: easeCubicIn,
        //   enter: value => [value[0], value[1], value[2], 255] // fade in
        // }
      }

    })
  }

  getPickingInfo (pickParams) {
    // console.log(this.state);
    // this.setState({elev: 100});
    return pickParams.info
  }

  renderLayers () {
    return this.buildLayer()
  }
}

MapsPolygonLayerDbg.layerName = 'MapsPolygonLayerDbg'
