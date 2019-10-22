
import React, { Component } from 'react';
import { MapDataContext } from '../context/MapsContext';
import { SocketContext } from '../context/SocketContext';

import { MapViewer } from './MapViewer';


// UI Components
import { ModalWindow } from './modal/ModalWindow';
import { getImageUrl } from '../share/utils'; 

// Data vizualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer';
import { FootprintMapsLayer } from './layers/FootprintMapsLayer';
import { SearchResultLayer } from './layers/SearchResultLayer';
import { MapsDistributionLayer } from './layers/MapsDistributionLayer';
import { MapsPolygonLayer } from './layers/MapsPolygonLayer';
import { MapsBitmapLayer } from './layers/MapsBitmapLayer';
import { MapsLabelLayer } from './layers/MapsLabelLayer';


export class MapExplorer extends Component {

    state = {
        showModal: false,
        modalData: {}
    }
 
    /**
     * Open a modal window to display map detail data
     * @param {*} info 
     */
    showMapDetail({object}) {
        const [mapState, dispatch] = this.context;

        let {properties : {title, imageUrl, asset_id}} = object;
        if (!imageUrl) {
            imageUrl = getImageUrl(asset_id, '_crop_800')
        }

        this.setState({
            modalData : {title, imageUrl, asset_id},
            selectedMap: object,
            showModal: true
        });

        // Update map context to keep track with the selected map
        dispatch({ type: 'HIGHLIGHT_MAP', state: { highlightMap : asset_id } });
    }
    

    render() {
        // Note: DeckGL creates a custom React context for managing layers data
        // For that reason I am force to Initialize layers inside of the map explorer
        // them inject the custom MapContext. 
    
        // MapExplorer layers structure. [ Layer class, {props} ]
        // view == main or minimap or all
        // TODO: define a prop structure for this.
        const layers = [
            [SearchResultLayer, { view: 'all'}],
            [LandmarksLayer, { view: 'all'}], 
            // [MapsDistributionLayer, { view: 'master', onClick : (info) => { console.log(info)} }],
            [FootprintMapsLayer, { view: 'slave'}],
            [MapsPolygonLayer, { view:'master',  onClick : this.showMapDetail.bind(this)}],
            [MapsLabelLayer, {view: 'master'}],
            [MapsBitmapLayer, { id:'crop', name: 'crop', suffix: '_crop_800', view: 'slave', onClick : this.showMapDetail.bind(this)}],
            // [MapsBitmapLayer, { id:'edge', name: 'edge', suffix: '_edge_800', view: 'master'}], 
    
        ];
        
        const { showModal, modalData} = this.state;

        const { mode } = this.props;

        return (
            <SocketContext.Consumer>
                {socket => (
                    <React.Fragment>
                        <ModalWindow 
                            isOpen={showModal}
                            onRequestClose={() => this.setState({showModal : false})}
                            {...modalData}
                        />
                        <MapViewer
                            mode = {mode}
                            socketContext = {socket}
                            layers={layers}
                        ></MapViewer>
                    </React.Fragment>
                )}
            </SocketContext.Consumer>

        )
    }
}

MapExplorer.contextType = MapDataContext;