
import React, { useContext, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// UI Components
import { ModalWindow } from './ui/modal/ModalWindow'
import { Range } from './ui/range/Range'
import { Header } from './ui/header/Header'
import { Fog } from './ui/fog/Fog'
import { MapViewer } from './ui/mapViewer/MapViewer'
// import { MapViewer } from './MapViewerOld'

// Idle
import { useIdleTimer } from 'react-idle-timer'

// Data visualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer'
import { FootprintShadowLayer } from './layers/FootprintShadowLayer'
import { MapsPolygonLayer } from './layers/MapsPolygonLayer'
import { MapsCloudLayer } from './layers/MapsCloudLayer'

// Use only on development
import { TileImagesLayer } from './layers/TileImagesLayer'
import { MapsBitmapLayer } from './layers/MapsBitmapLayer'
import { MapsLabelLayer } from './layers/MapsLabelLayer'
import { MapsClusterCounts } from './layers/MapsClusterCounts'

// import { FootprintMapsLayer } from './layers/FootprintMapsLayer'
// import { MapsDistributionLayer } from './layers/MapsDistributionLayer'

// UI, Map actions and contexts
import { selectMap, focusIdleMap, focusMap, removeFocusMap } from '../context/UIActions'
import { MapDataContext } from '../context/MapsContext'
import { getMaps } from '../context/MapsActions'
import { UIContext } from '../context/UIContext'

// Utils
import { get, sample } from 'lodash'

export const MapExplorer = ({ mode }) => {
  const [state, setState] = useState({ showModal: false, ready: false })
  const [mapState, mapDispatch] = useContext(MapDataContext)
  const [uiState, UIDispatch] = useContext(UIContext)

  const _mapDispatch = useCallback(mapDispatch, [])

  // Load map data
  useEffect(() => {
    _mapDispatch(getMaps({})).then(() => {
      setState({ ready: true })
    })
  }, [_mapDispatch])

  const { ready, showModal } = state

  // Idle logic
  const { reset } = useIdleTimer({
    timeout: 1000 * 30, // 60 * 0.4,
    onIdle: (_) => {
      // Get current filtered data and
      // select a random map from current range
      const selected = sample(get(mapState, 'maps.data', []))
      // Set selected as focus
      UIDispatch(focusIdleMap({
        ...selected,
        mouseX: 0,
        mouseY: 0
      }))

      // Restart Idle
      reset()
    },
    onActive: (_) => {
      // User no longer inactive
      UIDispatch(removeFocusMap())
    }
  })

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
        setState({
          showModal: true
        })
        // Update map context to keep track with the selected map
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
    [FootprintShadowLayer, { view: 'master' }],
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

      {showModal &&
        <ModalWindow
          isOpen={showModal}
          onRequestClose={() => setState({ showModal: false })}
        />}

      {ready > 0 &&
        <>
          <Header />
          <Range />
        </>}

      <MapViewer
        mode={mode}
        layers={layers}
        uiContext={[uiState, UIDispatch]}
      />

      <Fog />

    </>)
}

MapExplorer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'master', 'slave'])
}
