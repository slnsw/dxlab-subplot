
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { MapDataContext } from '../context/MapsContext'

import { MapViewer } from './MapViewer'

// UI Components
import { ModalWindow } from './ui/modal/ModalWindow'
import { Range } from './ui/range/Range'
import { Header } from './ui/header/Header'

// Data visualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer'
import { FootprintMapsLayer } from './layers/FootprintMapsLayer'
import { SearchResultLayer } from './layers/SearchResultLayer'
import { MapsDistributionLayer } from './layers/MapsDistributionLayer'
import { MapsPolygonLayer } from './layers/MapsPolygonLayer'
import { MapsBitmapLayer } from './layers/MapsBitmapLayer'
import { MapsLabelLayer } from './layers/MapsLabelLayer'
import { MapsClusterCounts } from './layers/MapsClusterCounts'
import { MapsCloudLayer } from './layers/MapsCloudLayer'
import { TileImagesLayer } from './layers/TileImagesLayer'

import { selectMap, focusMap, removeFocusMap } from '../context/UIActions'
import { get } from 'lodash'
import { UIContext } from '../context/UIContext'

export class MapExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
    this.UIDispatch = null
  }

  /**
     * Open a modal window to display map detail data
     * @param {*} info
     */
  showMapDetail ({ object }) {
    // console.log(object)
    if (object) {
      this.setState({
        showModal: true
      })
      // Update map context to keep track with the selected map
      this.UIDispatch(selectMap({ ...object }))
    }
  };

  onHover ({ object, x, y }) {
    // const [, dispatch] = this.context
    if (object) {
      // Update map context to keep track of map in focus
      this.UIDispatch(focusMap({
        ...object,
        mouseX: x,
        mouseY: y
      }))
    } else {
      this.UIDispatch(removeFocusMap())
    }
  }

  render () {
    // Note: DeckGL creates a custom React context for managing layers data
    // For that reason I am force to Initialize layers inside of the map explorer
    // them inject the custom MapContext.

    // MapExplorer layers structure. [ Layer class, {props} ]
    // view == main or minimap or all
    // TODO: define a prop structure for this.

    const handlers = {
      onClick: this.showMapDetail.bind(this),
      onHover: this.onHover.bind(this)

    }

    const layers = [
      // [SearchResultLayer, { view: 'all' }],
      [LandmarksLayer, { view: 'master' }],
      // [MapsDistributionLayer, { view: 'master' }]
      [FootprintMapsLayer, { view: 'all' }],
      [MapsPolygonLayer, { view: 'master', ...handlers }],
      [MapsCloudLayer, { view: 'master' }]

      // [MapsLabelLayer, { view: 'master' }]
      // [MapsClusterCounts, { view: 'master' }]
      // [MapsBitmapLayer, { id: 'crop', name: 'crop', suffix: 'crop', view: 'all', ...handlers }]
      // [MapsBitmapLayer, { id: 'edge', name: 'edge', suffix: '_edge.png', view: 'slave', ...handlers }]
      // [TileImagesLayer, { id: 'tile_crop', view: 'master', suffix: 'crop', ...handlers, material: false }],

    ]

    const { showModal } = this.state

    const { mode } = this.props
    const [state] = this.context
    const data = get(state, 'maps.data', [])

    return (

      <UIContext.Consumer>
        {([, UIDispatch]) => {
          this.UIDispatch = UIDispatch

          return (
            <>
              {showModal &&
                <ModalWindow
                  isOpen={showModal}
                  onRequestClose={() => this.setState({ showModal: false })}
                />}

              {data.length > 0 &&
                <>
                  <Header />
                  <Range />
                </>}

              <MapViewer
                mode={mode}
                layers={layers}
              />
            </>

          )
        }}

      </UIContext.Consumer>

    )
  }
}

MapExplorer.contextType = MapDataContext
MapExplorer.propTypes = {
  mode: PropTypes.oneOf(['kiosk', 'master', 'slave'])
}
