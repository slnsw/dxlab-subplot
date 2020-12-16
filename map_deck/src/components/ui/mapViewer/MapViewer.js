import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

import React, { useContext, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import DeckGL from '@deck.gl/react'
import Geocoder from 'react-map-gl-geocoder'
import { FlyToInterpolator } from 'deck.gl'
import { InteractiveMap } from 'react-map-gl'

// Custom mapbox style
import MAP_STYLE from './styles/dxmaps_v2.json'

import { MapDataContext } from '../../../context/MapsContext'
import { updateViewState } from '../../../context/UIActions'
import { UIContext } from '../../../context/UIContext'

import { get, isEmpty, debounce } from 'lodash'
import bearing from '@turf/bearing'

import lightingEffect from './lights'
import styles from './MapViewer.module.scss'

// TODO: Set this as a prop
// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }
const mapRef = React.createRef()
const geocoderContainerRef = React.createRef()

export const MapViewer = ({ mode, layers, showSearch = true, ...props }) => {
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
    const focus = uiState.focus || {}
    const centroid = get(focus, 'properties.centroid', null)

    if (centroid && uiState.isIdle) {
      const [longitude, latitude] = centroid.coordinates || []
      if (longitude && latitude) {
        const bounds = get(focus, 'properties.image_bounds.coordinates', [[], [], [], []])
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
  }, [uiState.focus, uiState.isIdle])

  // Update local and global map view state
  // NOTE: looks dogy however I need to be able to change
  // State from outside of the component and DeckGL don't
  // work correctly if the state is not local
  useEffect(() => {
    if (!isEmpty(uiState.viewState) && uiState.viewState.goTo) {
      setState({ viewState: uiState.viewState })
    }
  }, [uiState.viewState])

  // Instantiate layers and inject maps and filter data from the context.
  // WARNING: Doing this because DeckGL layers had already a context. At the moment of coding
  // this project, DeckGL layers are Class components so only one context can be set.
  const { data, filters } = mapState
  const preparedLayers = [...layers.map(([L, props]) => {
    props = {
      ...props,
      data,
      filters,
      uiContext: [uiState, UIDispatch],
      mapContext: [mapState, mapDispatch]
    }
    return new L({ ...props })
  })]

  // getting Mapbox viewState and style
  const { viewState } = state
  const mapStyle = (process.env.REACT_APP_MAPBOX_STYLE) ? `${process.env.REACT_APP_MAPBOX_STYLE}` : MAP_STYLE
  const { onViewChange } = props

  // Refresh global viewState without interfering with the
  // map rendering
  const refreshGlobalViewState = debounce((viewState) => {
    UIDispatch(updateViewState(viewState))
  }, 10)

  // Handlers
  const handleViewStateChange = useCallback(({ viewState }) => {
    // Important otherwise the map becomes static
    setState({ viewState })

    // NOTE: When updating UI context directly
    // without debounce cause rendering issues.
    refreshGlobalViewState(viewState)

    if (onViewChange) {
      // onViewChange(viewState)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleViewStateSearchChange = useCallback((viewState) => {
    // Move map to match location
    handleViewStateChange({
      viewState: {
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 3000,
        ...state.viewState,
        ...viewState

      }
    })
  }, [handleViewStateChange, state.viewState])

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
          {showSearch &&
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
            />}

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
  uiContext: PropTypes.array,
  showSearch: PropTypes.bool
}
