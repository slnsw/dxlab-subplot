
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
import { OpacityControl } from './ui/opacity/Opacity'
import { MapViewer } from './ui/mapViewer/MapViewer'

// Idle
import { useIdleTimer } from 'react-idle-timer'

import { FlyToInterpolator, WebMercatorViewport } from 'deck.gl'

// Data visualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer'
import { SearchAreaLayer } from './layers/SearchAreaLayer'
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
import { get, sample, isEmpty } from 'lodash'
import calculate_bbox from '@turf/bbox'
import calculate_center from '@turf/center'
import { About } from './ui/about/About'

export const MapExplorer = ({ mode = 'web' }) => {
  const [ready, setReady] = useState(false)
  const [idleId, setIdleId] = useState(null)
  const [restoreViewState, setRestoreViewState] = useState({})
  const [rangeStyle, setRangeStyle] = useState({})
  const [opacityStyle, setOpacityStyle] = useState({ opacity: 0 })
  const [navigatorStyle, setNavigatorStyle] = useState({})
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

    if (data.length === 0) {
      runIdle()
    }

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

    try {
      const { width, height } = viewState
      // If width or height not found it means we just initialize the app
      if (!width || !height) {
        viewState.width = window.innerWidth
        viewState.height = window.innerHeight
      }

      const viewport = new WebMercatorViewport(viewState)
      const bbox = near.all.bbox
      // console.log(viewport.fitBounds(near.all.bbox))
      const { zoom } = viewport.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]])
      viewState.zoom = zoom
    } catch (e) {
      console.warn('can\'t calculate zoom')
    }

    UIDispatch(goToViewState(viewState))
  }

  const handleViewChange = (viewState) => {
    // UIDispatch(updateViewState(viewState))
    // mapDispatch(updateViewState(viewState))

    // // Calculate if we are still within the lookup zone requested by the user
    // const { near = {} } = mapState
    // if (!isEmpty(near)) {
    //   const { center: lookupRoi } = near
    //   const { longitude, latitude } = viewState
    //   const lookupAt = point([longitude, latitude])
    //   const dst = distance(lookupRoi, lookupAt, { units: 'kilometers' })
    //   if (dst > 5) {
    //     // Clean search near lookups
    //     // mapDispatch(clearMapsWithin())
    //   }
    // }
  }

  useEffect(() => {
    const selected = get(uiState, 'selected', {})

    if (!isEmpty(selected)) {
      setRangeStyle({ width: '50vw' })
      setOpacityStyle({ opacity: 1 })
      setNavigatorStyle({ bottom: '300px' })
      setShowSearch(false)

      // center selected
      // Fit to view
      try {
        const viewState = {
          ...uiState.viewState
        }

        // Store point of return
        if (isEmpty(restoreViewState)) {
          setRestoreViewState({ ...viewState })
        }

        const { width, height } = viewState
        // If width or height not found it means we just initialize the app
        if (!width || !height) {
          viewState.width = window.innerWidth
          viewState.height = window.innerHeight
        }

        const halfWindowWidth = viewState.width * 0.5
        const halfWindowHeight = viewState.height * 0.5

        const image_bounds = get(selected, 'properties.image_bounds')
        const bbox = calculate_bbox(image_bounds)
        const center = get(calculate_center(image_bounds), 'geometry.coordinates')
        let viewport = new WebMercatorViewport(viewState)
        const selectedViewState = viewport.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]])

        viewport = new WebMercatorViewport(selectedViewState)
        const mapCenter = viewport.getMapCenterByLngLatPosition({
          lngLat: center,
          pos: [halfWindowWidth + (halfWindowWidth * 0.5), halfWindowHeight]
        })

        UIDispatch(goToViewState({
          ...viewState,
          ...selectedViewState,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 1000,
          longitude: mapCenter[0],
          latitude: mapCenter[1]
        }))
      } catch (e) {
        console.warn('can\'t calculate zoom')
      }
    } else {
      setRangeStyle({ })
      setOpacityStyle({ opacity: 0 })
      setNavigatorStyle({ })

      setShowSearch(true)
      // Go back to viewstate before map selection
      if (!isEmpty(restoreViewState)) {
        UIDispatch(goToViewState({
          ...restoreViewState,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 1000
        }))
        setRestoreViewState({})
      }
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
        // const asset_id = get(object, 'properties.asset_id')
        // const select = find(get(mapState, 'data', []), ['properties.asset_id', asset_id])
        // console.log(object, select)
        UIDispatch(selectMap({ ...object }))
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
    [SearchAreaLayer, { view: 'master' }],
    [LandmarksLayer, { view: 'master', material: false }],
    // [MapsPolygonLayer, { view: 'master', ...handlers }],
    [MapsCloudLayer, { view: 'master', ...handlers }]

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
      <About />

      {ready > 0 &&
        <>
          <Header />
          <LookupInfo />
          <Search
            useVirtualKeyboard={mode === 'kiosk'}
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

      <NavigationControl style={navigatorStyle} />
      <OpacityControl style={opacityStyle} />
      <Fog />

    </>)
}

MapExplorer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'web'])
}
