
import React, { useContext, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// UI Components
import { ModalWindow } from './ui/modal/ModalWindow'
import { Range } from './ui/range/Range'
import { Header } from './ui/header/Header'
import { LookupInfo } from './ui/lookups/LookupInfo'
import { Fog } from './ui/fog/Fog'
import { MapViewer } from './ui/mapViewer/MapViewer'
// import { MapViewer } from './MapViewerOld'

// Idle
import { useIdleTimer } from 'react-idle-timer'

// Data visualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer'
import { FootprintShadowLayer } from './layers/FootprintShadowLayer'
import { SearchAreaLayer } from './layers/SearchAreaLayer'
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
import { selectMap, focusIdleMap, focusMap, removeFocusMap } from '../context/UIActions'
import { MapDataContext } from '../context/MapsContext'
import { getMaps, getMapsWithin, clearMapsWithin, updateViewState } from '../context/MapsActions'
import { UIContext } from '../context/UIContext'

// Utils
import { get, sample, isEmpty, find } from 'lodash'
import distance from '@turf/distance'
import { point } from '@turf/helpers'

export const MapExplorer = ({ mode }) => {
  const [ready, setReady] = useState(false)
  const [rangeStyle, setRangeStyle] = useState({})
  const [showSearch, setShowSearch] = useState(true)
  const [mapState, mapDispatch] = useContext(MapDataContext)
  const [uiState, UIDispatch] = useContext(UIContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _mapDispatch = useCallback(mapDispatch, [])

  // Load map data
  useEffect(() => {
    _mapDispatch(getMaps({})).then(() => {
      setReady(true)
    })
  }, [_mapDispatch])

  // Idle logic
  const { reset } = useIdleTimer({
    timeout: 1000 * 30, // 60 * 0.4,
    onIdle: (_) => {
      // Get current filtered data and
      // select a random map from current range
      const selected = sample(get(mapState, 'data', []))
      // Set selected as focus
      UIDispatch(focusIdleMap({
        ...selected,
        mouseX: 0,
        mouseY: 0
      }))

      // Restart Idle
      reset()

      // Clean search near lookups
      mapDispatch(clearMapsWithin())
    },
    onActive: (_) => {
      // User no longer inactive
      UIDispatch(removeFocusMap())
    }
  })

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
    mapDispatch(getMapsWithin({ center: result.geometry, radius: 2, placeName: result.place_name }))
  }

  const handleViewChange = (viewState) => {
    // console.log('change view')
    mapDispatch(updateViewState(viewState))

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
    [LandmarksLayer, { view: 'master' }],
    // [MapsDistributionLayer, { view: 'master' }]
    // [MapsLabelLayer, { view: 'master' }],
    // [FootprintMapsLayer, { view: 'all' }],
    [MapsPolygonLayer, { view: 'master', ...handlers }],
    [MapsCloudLayer, { view: 'master' }]

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
          <Range style={rangeStyle} />
        </>}

      <MapViewer
        mode={mode}
        layers={layers}
        uiContext={[uiState, UIDispatch]}
        onGeoLookupSearchResult={handleGeoSearchResult}
        onViewChange={handleViewChange}
        showSearch={showSearch}
      />

      <Fog />

    </>)
}

MapExplorer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'master', 'slave'])
}
