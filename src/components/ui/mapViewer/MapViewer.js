import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import DeckGL from '@deck.gl/react'
import Geocoder from 'react-map-gl-geocoder'
import { FlyToInterpolator } from 'deck.gl'
import { InteractiveMap } from 'react-map-gl'

// Custom mapbox style
import MAP_STYLE from './styles/dxmaps_v2.json'

import { MapDataContext } from '../../../context/MapsContext'
import { UIContext } from '../../../context/UIContext'

import { get } from 'lodash'
import bearing from '@turf/bearing'

import lightingEffect from './lights'
import styles from './MapViewer.module.scss'

// TODO: Set this as a prop
// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }
const mapRef = React.createRef()
const geocoderContainerRef = React.createRef()

export const MapViewer = ({ mode, layers, ...props }) => {
  const [mapState, mapDispatch] = useContext(MapDataContext)
  const [uiState, UIDispatch] = useContext(UIContext)
  const [state, setState] = useState({
    viewState: {
      latitude: -33.8589,
      longitude: 151.2101,
      bearing: -163,
      pitch: 60,
      zoom: 14, // 15
      reuseMaps: true
    }
  })

  useEffect(() => {
    const centroid = get(uiState, 'focus.properties.centroid', null)
    const isIdle = get(uiState, 'isIdle', false)

    if (centroid && isIdle) {
      const [longitude, latitude] = centroid.coordinates || []
      if (longitude && latitude) {
        const bounds = get(uiState, 'focus.properties.image_bounds.coordinates', [[], [], [], []])
        const focusBearing = bearing(bounds[0][0], bounds[0][3])
        const goTo = {
          longitude,
          latitude,
          zoom: 14,
          transitionDuration: 3000,
          bearing: focusBearing,
          pitch: Math.floor(Math.random() * Math.floor(60)),
          transitionInterpolator: new FlyToInterpolator()
        }
        handleViewStateSearchChange(goTo)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.focus, uiState])

  // Instantiate layers and inject maps and filter data from the context.
  // WARNING: Doing this because DeckGL layers had already context and they the DeckGL layers
  // are Class components so only one context can be set. At the moment of coding
  // this projects Functional Layer components where not available.
  const { data, filters } = mapState
  const preparedLayers = [...layers.map(([L, props]) => {
    props = {
      ...props,
      data,
      filters,
      uiContext: [uiState, UIDispatch]
    }
    return new L({ mapsContext: state, dispatch: mapDispatch, ...props })
  })]

  // getting Mapbox viewState and style
  const { viewState } = state
  const mapStyle = (process.env.REACT_APP_MAPBOX_STYLE) ? `${process.env.REACT_APP_MAPBOX_STYLE}` : MAP_STYLE

  // Handlers
  const handleViewStateChange = ({ viewState }) => {
    // Important otherwise the map becomes static
    setState({ viewState })

    const { onViewChange } = props
    if (onViewChange) {
      onViewChange(viewState)
    }
  }

  const handleViewStateSearchChange = (viewState) => {
    // Move map to match location
    handleViewStateChange({
      viewState: {
        ...state.viewState,
        ...viewState
      }
    })
  }

  const handleOnResult = (event) => {
    const { onGeoLookupSearchResult } = props

    if (onGeoLookupSearchResult) {
      const { result } = event
      onGeoLookupSearchResult(result)
    }
  }

  // Layer visibility
  const getParent = (layer) => {
    let parent = null
    if (layer) {
      parent = layer.parent
      if (parent && parent.parent) {
        parent = getParent(parent)
      }
    }
    return parent
  }

  const layerViewVisibility = ({ layer, viewport }) => {
    const container = getParent(layer)
    if (container) {
      const { view } = container.props
      if (view === mode || view === 'all' || mode === 'kiosk') {
        return true
      }
    }

    return false
  }

  return (
    <>
      {/* :P ;( horrible Geocoder needs to be a child of InteractiveMap for that
    reason Geocoder provides containerRef to allow render it outside */}
      <div
        ref={geocoderContainerRef}
        className={styles.geoCoder}
      />

      <DeckGL
        layerFilter={layerViewVisibility}
        effects={[lightingEffect]}
        layers={preparedLayers}
        viewState={viewState}
        controller
        onViewStateChange={(handleViewStateChange)}
        far={20}
      >

        <InteractiveMap
          reuseMaps
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          mapStyle={mapStyle}
          preventStyleDiffing
          ref={mapRef}
        >

          <Geocoder
            mapRef={mapRef}
            containerRef={geocoderContainerRef}
            onResult={handleOnResult}
            placeholder='Lookup address'
            countries='au'
            proximity={proximity}
            onViewportChange={handleViewStateSearchChange}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            position='top-left'
          />

        </InteractiveMap>

      </DeckGL>

    </>
  )
}

MapViewer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'master', 'slave']),
  layers: PropTypes.array,
  onGeoLookupSearchResult: PropTypes.func,
  onViewChange: PropTypes.func,
  uiContext: PropTypes.array
}
