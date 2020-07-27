import 'react-dat-gui/build/react-dat-gui.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DeckGL from '@deck.gl/react'
import { View, MapView } from '@deck.gl/core'
import { InteractiveMap } from 'react-map-gl'

import Geocoder from 'react-map-gl-geocoder'

// Custom mapbox style
import MAP_STYLE from '../styles/dxmaps_v2.json'

import { MapDataContext } from '../context/MapsContext'

// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }
const mapRef = React.createRef()

export class MapViewerDual extends Component {
  constructor (props) {
    super(props)
    this.state = {
      viewState: {
        // latitude: -33.8589,
        // longitude: 151.2101,
        // bearing: -163,
        // pitch: 60,
        // zoom: 16,
        // reuseMaps: true,
        main: {
          latitude: -33.8589,
          longitude: 151.2101,
          bearing: -163,
          pitch: 60,
          zoom: 16,
          reuseMaps: true
        },
        minimap: {
          latitude: -33.8589,
          longitude: 151.2101,
          zoom: 14,
          pitch: 0,
          bearing: -163,
          reuseMaps: true
        }
      }
    }

    this.layerViewVisibility = this.layerViewVisibility.bind(this)
    this.handleViewStateChange = this.handleViewStateChange.bind(this)
    this.handleViewStateSearchChange = this.handleViewStateSearchChange.bind(this)
    this.handleOnResult = this.handleOnResult.bind(this)
  }

  componentDidMount () {
    const [, dispatch] = this.context
    dispatch({ type: 'SOCKET_CONNECT_SERVER' })
    dispatch({
      type: 'SOCKET_LISTEN',
      callback: ({ viewState }) => {
        console.log(viewState)
        this.setState({ viewState })
        this.handleOnViewChange(viewState)
      }
    })

    dispatch({
      type: 'SOCKET_LISTEN_SEARCH',
      callback: ({ viewState }) => {
        console.log(viewState)
        this.setState({ viewState })
        this.handleOnViewChange(viewState)
      }
    })

    this.handleOnViewChange(this.state.viewState)
  }

  handleOnResult (event) {
    const { onResult } = this.props
    if (onResult) {
      onResult(event)
    }
  }

  handleOnViewChange (viewState) {
    // const { main: { latitude, longitude, zoom } } = viewState
    // const [mapState, dispatch] = this.context

    // const around = {
    //   type: 'Feature',
    //   geometry: {
    //     type: 'Point',
    //     coordinates: [longitude, latitude]
    //   },
    //   properties: {
    //     zoom: zoom,
    //     radius: mapState.aroundRadius
    //   }
    // }

    // dispatch({ type: 'GET_MAPS_SUCCESS', state: { around } });

    const { onViewChange } = this.props
    if (onViewChange) {
      onViewChange(viewState)
    }
  }

  handleViewStateSearchChange (viewState) {
    console.log(viewState)
    this.handleViewStateChange({
      viewState: {
        ...this.state.viewState,
        ...viewState
      }
    })
  }

  handleViewStateChange ({ viewState, viewId }) {
    // Single view implementation
    // this.setState({ viewState });
    // this.handleOnViewChange(viewState);

    // const [mapState, dispatch] = this.context

    // main and minimap view implementation
    this.setState({
      viewState: {
        main: {
          ...viewState,
          // bearing: -163,
          zoom: viewState.zoom + 2,
          pitch: 60
        },
        minimap: viewState
      }
    }, () => {
      const [, dispatch] = this.context
      const newState = this.state.viewState
      dispatch({
        type: 'SOCKET_EMIT',
        state: {
          data: { viewState: newState, viewId: viewId }
        }
      })

      this.handleOnViewChange(this.state.viewState)
    })
  }

  getParent (layer) {
    let parent = layer.parent
    if (parent.parent) {
      parent = this.getParent(parent)
    }
    return parent
  }

  layerViewVisibility ({ layer, viewport }) {
    const container = this.getParent(layer)
    if (container) {
      const { view } = container.props
      if (viewport.id === view || view === 'all') {
        return true
      }
    }

    return false
  };

  render () {
    const layers = [
      ...this.props.layers.map(([L, props]) => {
        const data = this.context[0].data
        props = {
          data: data,
          ...props
        }
        return new L({ mapContext: this.context, ...props })
      })
    ]

    const views = [
      new MapView({
        id: 'main',
        controller: false
      }),
      new MapView({
        id: 'minimap',
        x: '68%',
        y: '45%',
        width: '30%',
        height: '50%',
        clear: true,
        controller: {
          // maxZoom: 11,
          // minZoom: 11,
          // dragRotate: false,
          // keyboard: false
        }
      })
    ]

    const { viewState } = this.state

    return (
      <>

        <DeckGL
          layerFilter={this.layerViewVisibility}
          views={views}
          layers={layers}
          viewState={viewState}
          // controller={MapController}
          onViewStateChange={this.handleViewStateChange}
        >

          <InteractiveMap
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            mapStyle={MAP_STYLE}
            preventStyleDiffing
            ref={mapRef}
          />

          <View id='minimap'>
            <InteractiveMap
              mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              // mapStyle="mapbox://styles/mapbox/dark-v9"
              preventStyleDiffing
              ref={mapRef}
            >

              <Geocoder
                mapRef={mapRef}
                onResult={this.handleOnResult}
                placeholder='Lookup address'
                countries='au'
                proximity={proximity}
                onViewportChange={this.handleViewStateSearchChange}
                mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                position='top-left'
              />

            </InteractiveMap>
          </View>
        </DeckGL>

      </>

    )
  }
}

MapViewerDual.contextType = MapDataContext
MapViewerDual.propTypes = {
  layers: PropTypes.array,
  onResult: PropTypes.func,
  onViewChange: PropTypes.func
}
