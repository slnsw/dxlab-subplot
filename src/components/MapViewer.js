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
const geocoderContainerRef = React.createRef();

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

    prepareLayers( ) {
        return [
            ...this.props.layers.map(([L, props]) => {
                let data = this.context[0].data;
                props = {
                    data: data,
                    ...props
                }
                return new L({ mapContext: this.context, ...props })
            }),
        ]
    }

    render() {

        const layers = this.prepareLayers();


        const { mode } = this.props;
        const showSearch = (mode === 'master' || mode === 'kiosk');
        const mapStyle = (mode === 'master') ?  "mapbox://styles/dimago/ck214ikre05wd1coehgmj34en" : MAP_STYLE;
        const mapcontroller = (mode === 'master' || mode === 'kiosk');
        const viewState  = {
            ...this.state.viewState
        };

        viewState.pitch = (mode === 'master') ? 0 : viewState.pitch; 

        const fogStyle = {
            zIndex: '100',
            position: 'relative',
            display: 'block',
            height: '100vh',
            width: '100vw',
            /* background: rgb(2,0,36);
            background: linear-gradient(0deg, rgba(2,0,36,0) 0%, rgba(9,9,121,.1) 35%, rgba(0,212,255,.8) 100%); */
          
            background: 'rgb(0,0,0)',
            // background: 'linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(112,112,122,.1) 25%, rgba(247,247,247,0) 100%)',
            background: 'radial-gradient(circle, rgba(247,247,247,0) 0%, rgba(112,112,122,.1) 25%,   rgba(0,0,0,1) 100%)',
            pointerEvents: 'none',
        }

        return (
            <React.Fragment>
                {/* :P ;( horrible Gecoder needs to be a child of InteractiveMap for that 
                reason Gecoder provides containerRef to allow render it outside */}
                <div
                    ref={geocoderContainerRef}
                    style={{
                        height: 50,
                        position: "absolute",
                        alignItems: "center",
                        margin: '10px',
                        zIndex: 200
                    }}
                />

                <DeckGL
                    layerFilter={this.layerViewVisibility.bind(this)}
                    layers={layers}
                    viewState={viewState}
                    controller={mapcontroller}
                    onViewStateChange={this.onViewStateChange.bind(this)}
                >

                    <InteractiveMap
                        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                        mapStyle={mapStyle}
                        preventStyleDiffing={true}
                        ref={mapRef}
                    >

                        {showSearch && <Geocoder
                            mapRef={mapRef}
                            containerRef={geocoderContainerRef}
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

                {/* { mode === "kiosk" || mode === "slave" &&  } */}
                <div style={fogStyle}></div>

            </React.Fragment>


        )
    }
}

MapViewer.contextType = MapDataContext;