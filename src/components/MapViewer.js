import 'react-dat-gui/build/react-dat-gui.css';
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

import React, { Component } from 'react';
import DeckGL from '@deck.gl/react';
import { InteractiveMap } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";

// Custom mapbox style
import MAP_STYLE from '../styles/dxmaps_v2.json';

import { MapDataContext } from '../context/MapsContext';


// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }
const mapRef = React.createRef();

export class MapViewer extends Component {

    state = {
        viewState: {
            latitude: -33.8589,
            longitude: 151.2101,
            bearing: -163,
            pitch: 60,
            zoom: 15,
            reuseMaps: true,
        }

    }


    componentDidMount() {
        const [, socketDispatch] = this.props.socketContext;
        socketDispatch({ type: 'SOCKET_CONNECT_SERVER' });
        socketDispatch({
            type: 'SOCKET_LISTEN', callback: ({ viewState }) => {
                this.setState({ viewState });
                this.handleOnViewChange(viewState);
            }
        });

        socketDispatch({
            type: 'SOCKET_LISTEN_SEARCH', callback: (data) => {
                console.log('search', data.result.text)
                // this.setState({ viewState });
                // console.log(this.geocoder.query(data.result.text));
            }
        });


    
        this.handleOnViewChange(this.state.viewState);
    }

    handleOnResult(event) {
        const { onResult } = this.props;
        const [, socketDispatch] = this.props.socketContext;
        socketDispatch({
            type: 'SOCKET_EMIT_SEARCH', state: {
                data: event
            }
        });

        if (onResult) {
            onResult(event);
        }
    }

    handleOnViewChange(viewState) {
        const { latitude, longitude, zoom } = viewState;
        const [mapState, dispatch] = this.context;


        const around = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            properties: {
                'zoom': zoom,
                'radius': mapState.aroundRadius
            }
        }

        dispatch({ type: 'GET_MAPS_AROUND', state: { around } });

        const { onViewChange } = this.props;
        if (onViewChange) {
            onViewChange(viewState);
        }
    }

    onViewStateSearchChange(viewState) {
        console.log(viewState)
        this.onViewStateChange({
            viewState: {
                ...this.state.viewState,
                ...viewState,
            }
        });
    }

    onViewStateChange({ viewState, viewId }) {
        // Single view implemenation

        const onUpdateState = () => {
            const [, socketDispatch] = this.props.socketContext;
            const newState = {
                ...this.state.viewState,
                zoom: viewState.zoom,
                pitch: 60
            }
            socketDispatch({
                type: 'SOCKET_EMIT', state: { 
                    data: { viewState: newState, viewId: viewId }
                }
            });

            this.handleOnViewChange(this.state.viewState);

        }

        this.setState({ 
            viewState : {
                ...viewState,
                pitch: 0
            } 
        }, onUpdateState);


    }

    getParent(layer) {
        let parent = layer.parent;
        if (parent.parent) {
            parent = this.getParent(parent);
        }
        return parent
    }

    layerViewVisibility({ layer, viewport }) {
        let container = this.getParent(layer);
        if (container) {

            const { view } = container.props;
            const { mode } = this.props;

            if (view === mode || view === 'all') {
                return true;
            }
        }

        return false;
    };

    render() {

        const layers = [
            ...this.props.layers.map(([L, props]) => {
                let data = this.context[0].data;
                props = {
                    data: data,
                    ...props
                }
                return new L({ mapContext: this.context, ...props })
            }),
        ]


        const { mode } = this.props;

        const showSearch = (mode === 'master' || mode === 'kiosk');
        const mapStyle = (mode === 'master') ?  "mapbox://styles/dimago/ck214ikre05wd1coehgmj34en" : MAP_STYLE;
        const mapcontroller = (mode === 'master' || mode === 'kiosk');


        const viewState  = {
            ...this.state.viewState
        };

        viewState.pitch = (mode === 'master') ? 0 : viewState.pitch; 


        return (
            <React.Fragment>

                <DeckGL
                    layerFilter={this.layerViewVisibility.bind(this)}
                    layers={layers}
                    viewState={viewState}
                    controller={mapcontroller}
                    onViewStateChange={this.onViewStateChange.bind(this)}
                >

                    <InteractiveMap
                        // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                        mapStyle={mapStyle}
                        preventStyleDiffing={true}
                        ref={mapRef}
                    >

                        {showSearch && <Geocoder
                            mapRef={mapRef}
                            onResult={this.handleOnResult.bind(this)}
                            placeholder="Lookup address"
                            countries="au"
                            proximity={proximity}
                            onViewportChange={this.onViewStateSearchChange.bind(this)}
                            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                            position="top-left"
                        />}

                    </InteractiveMap>

                </DeckGL>

            </React.Fragment>


        )
    }
}

MapViewer.contextType = MapDataContext;