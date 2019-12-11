import 'react-dat-gui/build/react-dat-gui.css';
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import 'rc-slider/assets/index.css';

import React, { Component } from 'react';
import DeckGL from '@deck.gl/react';
import { InteractiveMap } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";

// Custom mapbox style
import MAP_STYLE from '../styles/dxmaps_v2.json';

import { MapDataContext } from '../context/MapsContext';
import { getMaps } from '../context/MapsActions';
import { socketConnect, socketEmit } from '../context/SocketActions';
import { linealScale } from '../share/utils';
import { debounce, keys, pick, filter, includes } from 'lodash';

// import { Range } from 'rc-slider';
import styles from './MapViewer.module.scss';


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
        const [, dispatch] = this.context;
        const {mode} = this.props;
        // TODO: Clean up too much going on here!

        if (mode !== 'kiosk') {
            dispatch(socketConnect({
                listenCallback: ({ subject, data }) => {

                    switch (subject) {
                        case 'viewchange':
                            const { viewState } = data;

                            // Remove transitions let update the position via messages
                            const ks = filter(keys(viewState), (k) => !includes(['transitionInterpolator', 'transitionDuration'], k));
                            const cleanState = pick(viewState, ks);

                            this.setState({ viewState: cleanState });
                            this.handleOnViewChange(cleanState);
                            break;

                        default:
                        // nothing;
                    }
                }
            }));
        }

        this.handleOnViewChange(this.state.viewState);
    }

    handleOnResult(event) {
        const { onResult } = this.props;

        if (onResult) {
            onResult(event);
        }
    }


    handleOnViewChange = debounce((viewState) => {
        const { latitude, longitude, zoom } = viewState;
        const [state, dispatch] = this.context;

        // Calculate "optimal" radius to search
        const aroundRadius = linealScale(zoom, [15, 12], [800, 4000]);


        const around = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            properties: {
                'zoom': zoom,
                'radius': aroundRadius
            }
        }

        if (state.maps.data.length === 0) {
            dispatch(getMaps({ around }));
        }

        const { onViewChange } = this.props;
        if (onViewChange) {
            onViewChange(viewState);
        }
    }, 10);

    onViewStateSearchChange(viewState) {
        this.onViewStateChange({
            viewState: {
                ...this.state.viewState,
                ...viewState,
            }
        });
    }

    onViewStateChange({ viewState, viewId }) {
        // Single view implemenation
        const { mode } = this.props;

        const onUpdateState = () => {
            const [state, dispatch] = this.context;
            const newState = {
                ...this.state.viewState,
                zoom: viewState.zoom,
                pitch: 60
            }

            dispatch(
                socketEmit({
                    subject: 'viewchange',
                    data: { viewState: newState, filter: state.maps.filter }
                })
            );

            this.handleOnViewChange(this.state.viewState);

        }

        this.setState({
            viewState: {
                ...viewState,
                ...( mode === 'slave' && {pitch: 0})
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

            if (view === mode || view === 'all' || mode === 'kiosk') {
                return true;
            }
        }

        return false;
    };

    prepareLayers() {
        const data = this.context[0].maps.data;
        const filter = this.context[0].maps.filter;
        if (data.length > 0) {
            return [
                ...this.props.layers.map(([L, props]) => {
                    props = {
                        ...props,
                        data,
                        filter
                    }
                    const [state, dispatch] = this.context;
                    return new L({ contextState: state, dispatch, ...props })
                }),
            ]
        } else {
            return [];
        }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo);
      }

    render() {

        const layers = this.prepareLayers();


        const { mode } = this.props;
        const showSearch = (mode === 'master' || mode === 'kiosk');
        const mapStyle = (mode === 'master') ? `${process.env.REACT_APP_MAPBOX_STYLE}` : MAP_STYLE;
        const mapcontroller = (mode === 'master' || mode === 'kiosk');
        const viewState = {
            ...this.state.viewState
        };

        viewState.pitch = (mode === 'master') ? 0 : viewState.pitch;



        const [state, dispatch] = this.context;
        const { maps: { filter } } = state;

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
                        reuseMaps
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
                <div className={styles.fog}></div>
                {/* 
                { mode === "kiosk" || mode === "master" &&  
                    <Range 
                        min={1880} 
                        max={1950} 
                        defaultValue={[from, to]} 
                        tipFormatter={value => `${value}%`} 
                        pushable
                        onChange={([from, to]) => {
                            dispatch(getMaps({from, to }));
                        }}/>
                } */}


            </React.Fragment>


        )
    }
}

MapViewer.contextType = MapDataContext;