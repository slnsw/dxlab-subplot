
import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

// UI Components
import { ModalWindow } from './ui/modal/ModalWindow'
import { Range } from './ui/range/Range'
import { Header } from './ui/header/Header'
import { LookupInfo } from './ui/lookups/LookupInfo'
import { Search } from './ui/search/Search'
import { Fog } from './ui/fog/Fog'
import { NavigationControl } from './ui/navigation/Navigation'
import { MapViewer } from './ui/mapViewer/MapViewer'

// Idle
import { useIdleTimer } from 'react-idle-timer'

import { FlyToInterpolator } from 'deck.gl'

// Data visualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer'
import { FootprintShadowLayer } from './layers/FootprintShadowLayer'
import { SearchAreaLayer } from './layers/SearchAreaLayer'
import { MapsPolygonLayerOld } from './layers/MapsPolygonLayerOld'
import { MapsPolygonLayer } from './layers/MapsPolygonLayer'
import { MapsCloudLayer } from './layers/MapsCloudLayer'

// Use only on development
// import { TileImagesLayer } from './layers/TileImagesLayer'
// import { MapsBitmapLayer } from './layers/MapsBitmapLayer'
// import { MapsLabelLayer } from './layers/MapsLabelLayer'
// import { MapsClusterCounts } from './layers/MapsClusterCounts'

// import { FootprintMapsLayer } from './layers/FootprintMapsLayer'
// import { MapsDistributionLayer } from './layers/MapsDistributionLayer'

// UI, Map actions and contexts
import { selectMap, focusIdleMap, focusMap, removeFocusMap, goToViewState } from '../context/UIActions'
import { MapDataContext } from '../context/MapsContext'
import { getMapsWithin, clearMapsWithin, applyFilters } from '../context/MapsActions'
import { UIContext } from '../context/UIContext'

// Utils
import { get, sample, isEmpty, find } from 'lodash'
import distance from '@turf/distance'
import { point } from '@turf/helpers'

export const MapExplorer = ({ mode = 'kiosk' }) => {
  const [ready, setReady] = useState(false)
  const [idleId, setIdleId] = useState(null)
  const [rangeStyle, setRangeStyle] = useState({})
  const [showSearch, setShowSearch] = useState(true)
  const [mapState, mapDispatch] = useContext(MapDataContext)
  const [uiState, UIDispatch] = useContext(UIContext)

  useEffect(() => {
    setReady(true)
  }, [mapState.dataSet])

  // Idle logic
  const idleTimeout = 1000 * 30 // 60 * 0.4,
  const { isIdle } = useIdleTimer({
    timeout: idleTimeout,
    onIdle: (_) => {
      // Run actually idle action in timeout loop
      setIdleId(runIdle())
    },
    onActive: (_) => {
      clearTimeout(idleId)
      // User no longer inactive
      UIDispatch(removeFocusMap())
    }
  })

  const runIdle = () => {
    // Select a random time range
    const { maxYear, minYear } = get(mapState, 'meta', {})
    const sizeRange = Math.floor((Math.random() * 15) + 5)
    let startYear = Math.floor(Math.random() * (maxYear - minYear + 1) + minYear)
    let endYear = startYear + sizeRange

    endYear = (endYear > maxYear) ? maxYear : endYear
    startYear = (endYear - sizeRange > startYear) ? startYear - sizeRange : startYear

    const { data } = mapDispatch(applyFilters({ fromYear: startYear, toYear: endYear }))

    // Get current filtered data and
    // select a random map from current range
    // const selected = sample(get(mapState, 'data', []))

    // Select a random map of the random range
    const selected = sample(data)

    // Set selected as focus
    UIDispatch(focusIdleMap({
      ...selected,
      mouseX: 0,
      mouseY: 0
    }))

    // Clean search near lookups
    mapDispatch(clearMapsWithin())

    // re-run idle if user still idle
    return setTimeout(() => {
      if (isIdle()) {
        runIdle()
      }
    }, idleTimeout)
  }

  useEffect(() => {
    // Update search lookup info if near data are in the store
    const { near = {} } = mapState
    if (!isEmpty(near)) {
      const { center, radius, placeName } = near
      mapDispatch(getMapsWithin({ center, radius, placeName }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState.geoIndex])

  const handleGeoSearchResult = (result) => {
    // Find closest maps to the search
    const near = mapDispatch(getMapsWithin({ center: result.geometry, radius: 2, placeName: result.place_name }))
    let { all: { maxYear, minYear } = {} } = near

    if (maxYear && minYear) {
      minYear = (minYear === maxYear) ? minYear - 2 : minYear
      mapDispatch(applyFilters({ fromYear: minYear, toYear: maxYear }))
    }

    const { center } = result

    const viewState = {
      ...uiState.viewState,
      latitude: center[1],
      longitude: center[0],
      zoom: 13.5,
      pitch: Math.floor(Math.random() * Math.floor(30)),
      bearing: Math.floor(Math.random() * Math.floor(360)),
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000

    }

    UIDispatch(goToViewState(viewState))
  }

  const handleViewChange = (viewState) => {
    // UIDispatch(updateViewState(viewState))
    // mapDispatch(updateViewState(viewState))

    // Calculate if we are still within the lookup zone requested by the user
    const { near = {} } = mapState
    if (!isEmpty(near)) {
      const { center: lookupRoi } = near
      const { longitude, latitude } = viewState
      const lookupAt = point([longitude, latitude])
      const dst = distance(lookupRoi, lookupAt, { units: 'kilometers' })
      if (dst > 5) {
        // Clean search near lookups
        // mapDispatch(clearMapsWithin())
      }
    }
  }

  useEffect(() => {
    const selected = get(uiState, 'selected', {})

    if (!isEmpty(selected)) {
      setRangeStyle({ width: '50vw' })
      setShowSearch(false)
    } else {
      setRangeStyle({ })
      setShowSearch(true)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.selected])

  // LAYERS CONFIGURATIONS
  // Note: DeckGL creates a custom React context for managing layers data
  // For that reason I am force to Initialize layers inside of the map explorer
  // them inject the custom MapContext.

  // MapExplorer layers structure. [ Layer class, {props} ]
  // view == main or minimap or all
  // TODO: define a prop structure for this.
  const handlers = {
    onClick: ({ object }) => {
      // console.log(object)
      if (object) {
        // Update map context to keep track with the selected map
        // Find map from MapState because the data in Object is been
        // Modify to properly render polygons
        const asset_id = get(object, 'properties.asset_id')
        const select = find(get(mapState, 'data', []), ['properties.asset_id', asset_id])
        UIDispatch(selectMap({ ...select }))
      }
    },
    onHover: ({ object, x, y }) => {
      // const [, dispatch] = this.context
      if (object) {
        // Update map context to keep track of map in focus
        UIDispatch(focusMap({
          ...object,
          mouseX: x,
          mouseY: y
        }))
      } else {
        UIDispatch(removeFocusMap())
      }
    }

  }

  const layers = [
    [FootprintShadowLayer, { view: 'master' }],
    [SearchAreaLayer, { view: 'master' }],
    [LandmarksLayer, { view: 'master', material: false }],
    // [MapsPolygonLayerOld, { view: 'master', ...handlers }],
    [MapsPolygonLayer, { view: 'master', ...handlers }],
    [MapsCloudLayer, { view: 'master' }]

    // [MapsDistributionLayer, { view: 'master' }]
    // [MapsLabelLayer, { view: 'master' }],
    // [FootprintMapsLayer, { view: 'all' }],
    // [MapsClusterCounts, { view: 'master' }]
    // [MapsBitmapLayer, { id: 'crop', name: 'crop', suffix: 'crop', view: 'all', ...handlers }]
    // [MapsBitmapLayer, { id: 'edge', name: 'edge', suffix: '_edge.png', view: 'slave', ...handlers }]
    // [TileImagesLayer, { id: 'tile_crop', view: 'master', suffix: 'crop', ...handlers, material: false }],

  ]

  return (
    <>
      <ModalWindow />

      {ready > 0 &&
        <>
          <Header />
          <LookupInfo />
          <Search
            useVirtualKeyboard
            onGeoLookupSearchResult={handleGeoSearchResult}
          />
          <Range style={rangeStyle} />
        </>}

      <MapViewer
        mode={mode}
        layers={layers}
        uiContext={[uiState, UIDispatch]}
        onViewChange={handleViewChange}
        showSearch={showSearch}
      />

      <NavigationControl />
      <Fog />

    </>)
}

MapExplorer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'master', 'slave'])
}
