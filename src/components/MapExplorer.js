import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import { MapController } from 'deck.gl';
import { InteractiveMap } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";

// Custom mapbox style
import MAP_STYLE from '../styles/dxmaps_v2.json';

// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }
const mapRef = React.createRef();

export class MapExplorer extends Component {

    state = {
        viewState: {
            latitude: -33.8589,
            longitude: 151.2101,
            bearing: -163,
            pitch: 60, 
            zoom: 16,
            reuseMaps: true 
        },
    }

    componentDidMount() {
        this.handleOnViewChange(this.state.viewState);
      }

    handleOnResult(event) {
        const {onResult} = this.props;
        if (onResult) {
            onResult(event);
        }
    }

    handleOnViewChange(viewState) {
        const {onViewChange} = this.props;
        if (onViewChange) {
            onViewChange(viewState);
        }
    }

    onViewStateSearchChange(viewState) {
        this.onViewStateChange({
            viewState: {
            ...this.state.viewState,
            ...viewState,
            }
        });
    }

    onViewStateChange({viewState}) {
        this.setState({viewState});
        this.handleOnViewChange(viewState);
    }

    render() {
        const layers = [
            ...this.props.layers,
        ]
        const { viewState } = this.state;

        return (

                <DeckGL 
                    layers={layers}
                    viewState={viewState}
                    controller={MapController}
                    onViewStateChange={this.onViewStateChange.bind(this)}
                >

                    <InteractiveMap 
                        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                        mapStyle={MAP_STYLE}
                        preventStyleDiffing={true}
                        ref={mapRef}
                    >
                        <Geocoder
                            mapRef={mapRef}
                            onResult={this.handleOnResult.bind(this)}
                            placeholder="Lookup address"
                            countries="au"
                            proximity={proximity}
                            onViewportChange={this.onViewStateSearchChange.bind(this)}
                            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                            position="top-left"
                        />
       
                    </InteractiveMap>
                
                </DeckGL>

           
        )
    }

}