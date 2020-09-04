
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { MapDataContext } from '../context/MapsContext'

import { MapViewer } from './MapViewer'

// UI Components
import { ModalWindow } from './ui/modal/ModalWindow'
import { Range } from './ui/range/Range'
import { Header } from './ui/header/Header'
import IdleTimer from 'react-idle-timer'

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
import { UIContext } from '../context/UIContext'
import { getMaps } from '../context/MapsActions'
import { get, sample } from 'lodash'

export class MapExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false,
      ready: false
    }
    this.UIDispatch = null
    this.idleTimer = null

    this.handleOnIdle = this.handleOnIdle.bind(this)
  }

  componentDidMount () {
    const [, dispatch] = this.context
    console.log('MapExploreer')
    dispatch(getMaps({})).then(() => {
      this.setState({ ready: true })
    })
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

  handleOnIdle (event) {
    console.log('I am idle')
    this.idleTimer.reset()

    // Get a random map from current range
    const [state] = this.context
    const data = get(state, 'maps.data', [])
    const selected = sample(data)
    console.log(selected)
    this.UIDispatch(focusMap({
      ...selected,
      mouseX: 0,
      mouseY: 0
    }))
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
      // [MapsLabelLayer, { view: 'master' }],
      [FootprintMapsLayer, { view: 'all' }],
      [MapsPolygonLayer, { view: 'master', ...handlers }],
      [MapsCloudLayer, { view: 'master' }]

      // [MapsClusterCounts, { view: 'master' }]
      // [MapsBitmapLayer, { id: 'crop', name: 'crop', suffix: 'crop', view: 'all', ...handlers }]
      // [MapsBitmapLayer, { id: 'edge', name: 'edge', suffix: '_edge.png', view: 'slave', ...handlers }]
      // [TileImagesLayer, { id: 'tile_crop', view: 'master', suffix: 'crop', ...handlers, material: false }],

    ]

    const { showModal, ready } = this.state

    const { mode } = this.props
    const [state] = this.context
    const data = get(state, 'maps.data', [])

    return (

      <UIContext.Consumer>
        {uiContext => {
          // Weird I know but class components support for multiple context
          // work in this way.
          const [, UIDispatch] = uiContext
          this.UIDispatch = UIDispatch

          return (
            <>
              {/* <IdleTimer
                ref={ref => { this.idleTimer = ref }}
                timeout={1000 * 10} // 1000 * 60 * 15 = 15 Minutes
                onIdle={this.handleOnIdle}
                debounce={250}
              /> */}
              {showModal &&
                <ModalWindow
                  isOpen={showModal}
                  onRequestClose={() => this.setState({ showModal: false })}
                />}

              {ready > 0 &&
                <>
                  <Header uiContext={uiContext} />
                  <Range />
                </>}

              <MapViewer
                mode={mode}
                layers={layers}
                uiContext={uiContext}
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
