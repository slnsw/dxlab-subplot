/* eslint-disable no-unused-vars */

import { CompositeLayer } from 'deck.gl'
import { GeoJsonLayer, TextLayer } from '@deck.gl/layers'

import { getImageUrl, getYearElevation } from '../../share/utils/helpers'

import { load } from '@loaders.gl/core'
import { max, min, get } from 'lodash'
import { scaleLinear } from 'd3-scale'

export class MapsPolygonLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data, suffix } = props

      if (!data) {
        return
      }

      const { filters } = this.props
      const { fromYear, toYear } = filters

      const featuresData = data.reduce(function (result, el) {
        const { geometry, properties } = el
        if (geometry) {
          const { year } = properties
          const elevation = getYearElevation({ fromYear, toYear, year, offsetZ: 0 })

          const image = getImageUrl(properties.asset_id, suffix, '16')
          const feature = {
            ...el,
            geometry: {
              ...geometry,
              coordinates: [geometry.coordinates[0].map((c) => ([...c, elevation]))]
            },
            properties: {
              ...properties,
              elevation,
              image_url: image,
              // IMPORTANT: Change image bound structure to a single array
              // Deck.gl API needs image bounds in a single array.
              image_bounds: properties.image_bounds.coordinates[0].map((c) => ([...c, elevation])),
              centroid: [...properties.centroid.coordinates, elevation]
              // bearing: bearing(properties.image_bounds.coordinates[0][0], properties.image_bounds.coordinates[0][1]),
            }

          }
          result.push(feature)
        }
        return result
      }, [])

      const feature = {
        type: 'FeatureCollection',
        features: featuresData

      }
      this.setState({ feature })
    }
  }

  getImageBounds (bounds) {
    const points = bounds.map(p => this.context.viewport.project(p))
    const longs = points.map((c) => c[0])
    const lats = points.map((c) => c[1])

    // console.log(points)

    const left = max(longs)
    const right = min(longs)
    const top = max(lats)
    const bottom = min(lats)
    return { top, right, bottom, left }
  }

  getViewBounds () {
    const viewport = this.context.viewport
    return { top: 0, right: viewport.width, bottom: viewport.height, left: 0 }
  }

  buildLayers () {
    const { id, name, mapsContext, suffix, uiContext } = this.props
    const { feature: { features } } = this.state
    const layers = []

    const zoom = this.context.viewport.zoom
    const lod = [8, 16, 32, 64, 128, 512] //, 1024]
    const scale = scaleLinear([4, 18], [0, lod.length - 1])

    // TODO: Decouple this context from this layer. Option inject focus via props
    const [uiState] = uiContext
    const inFocus = get(uiState, 'focus.properties.asset_id', null)
    const inFocusYear = get(uiState, 'focus.properties.year', null)

    const geoJsonFillLayer = new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-geojson-cutlines`,
      data: this.state.feature,
      extruded: false,
      pickable: true,
      autoHighlight: false,
      stroked: true,

      getLineWidth: 3,
      getFillColor: [255, 255, 255, 125],
      getLineColor: [255, 255, 255, 255]

      /* getFillColor: (d) => {
        const currYear = get(d, 'properties.year', null)
        const opacity = (currYear !== inFocusYear && inFocusYear !== null) ? 0 : 125
        return [255, 255, 255, opacity]
      },
      getLineColor: (d) => {
        const currYear = get(d, 'properties.year', null)
        const opacity = (currYear !== inFocusYear && inFocusYear !== null) ? 0 : 255
        return [255, 255, 255, opacity]
      },
      updateTriggers: {
        getFillColor: [inFocus],
        getLineColor: [inFocus]
      },
      transitions: {
        getFillColor: 300,
        getLineColor: 300
      } */

    }))

    const mapLabels = new TextLayer(this.getSubLayerProps({
      id: `${id}-bitmap-label-${suffix}`,
      data: features,
      pickable: false,
      billboard: true,
      getSize: 16,
      sizeScale: 20 / 16,

      fontWeight: 800,
      fontFamily: 'Lekton',
      getPixelOffset: [0, -10, 0],
      getColor: (d) => {
        const opacity = (zoom < 13.5 || !inFocus || inFocus === d.properties.asset_id) ? 0 : 255
        return [255, 255, 255, opacity]
      },

      // autoHighlight: true,
      // getAngle: (d) => d.properties.bearing,
      getText: (d) => (d.properties.year.toString()),
      getPosition: (d) => d.properties.centroid,
      updateTriggers: {
        getColor: [zoom, inFocus]
      },
      transitions: {
        getColor: 300
      }

    }))

    layers.push(geoJsonFillLayer)
    layers.push(mapLabels)

    return layers
  }

  renderLayers () {
    // console.log('render images')
    return this.buildLayers()
    // return this.loadImages();
  }

  loadImage (url, inViewport) {
    let cancel = null
    return new Promise((resolve, reject) => {
      cancel = reject
      if (inViewport) {
        // console.log('visible')
        setTimeout(() => {
          load(url).then((r) => {
            // console.log('loaded', r.src);
            resolve(r)
          }).catch((err) => {
            // console.log(err);
            reject(err)
          })
        }
        , 5000)
        // resolve()
      } else {
        // console.log('hidden')
        resolve(null)
      }
    })
  }
}

MapsPolygonLayer.layerName = 'MapsPolygonLayer'

MapsPolygonLayer.defaultProps = {
  // // Shared accessors
  // getPosition: {type: 'accessor', value: x => x.position},
  // // Icon properties
  // iconAtlas: null,
  // iconMapping: {type: 'object', value: {}, async: true},
  // // Icon accessors
  // getIcon: {type: 'accessor', value: x => x.icon},
  // getIconSize: {type: 'accessor', value: 20},
  // getIconColor: {type: 'accessor', value: [0, 0, 0, 255]},
  // // Text properties
  // // fontFamily: DEFAULT_FONT_FAMILY,
  // // fontWeight: DEFAULT_FONT_WEIGHT,
  // // Text accessors
  // getText: {type: 'accessor', value: x => x.text},
  // getTextSize: {type: 'accessor', value: 12}
  // // getTextColor: {type: 'accessor', value: [0, 0, 0, 255]}
}
