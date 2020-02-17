
import React, { Component } from 'react';
import { MapDataContext } from '../context/MapsContext';

import { MapViewer } from './MapViewer';


// UI Components
import { ModalWindow } from './ui/modal/ModalWindow';
import { Range } from './ui/range/Range';
import { getImageUrl } from '../share/utils';

// Data vizualization and info layers
import { LandmarksLayer } from './layers/LandmarksLayer';
import { FootprintMapsLayer } from './layers/FootprintMapsLayer';
import { SearchResultLayer } from './layers/SearchResultLayer';
import { MapsDistributionLayer } from './layers/MapsDistributionLayer';
import { MapsPolygonLayer } from './layers/MapsPolygonLayer';
import { MapsBitmapLayer } from './layers/MapsBitmapLayer';
import { MapsLabelLayer } from './layers/MapsLabelLayer';
import { MapsClusterCounts } from './layers/MapsClusterCounts';
import { TileImagesLayer } from './layers/TileImagesLayer';

import { showDetailMap } from '../context/MapsActions';



export class MapExplorer extends Component {

    state = {
        showModal: false,
        modalData: {}
    }

    /**
     * Open a modal window to display map detail data
     * @param {*} info 
     */
    showMapDetail({ object }) {
        const [, dispatch] = this.context;
        // console.log(object)
        if (object) {
            let { properties: { title, image_url, asset_id } } = object;
            if (!image_url) {
                image_url = getImageUrl(asset_id, '_crop_800')
            }

            this.setState({
                modalData: { title, image_url, asset_id },
                selectedMap: object,
                showModal: true
            });

            // Update map context to keep track with the selected map
            dispatch(showDetailMap({ asset_id }))
        }
    };


    render() {
        // Note: DeckGL creates a custom React context for managing layers data
        // For that reason I am force to Initialize layers inside of the map explorer
        // them inject the custom MapContext. 

        // MapExplorer layers structure. [ Layer class, {props} ]
        // view == main or minimap or all
        // TODO: define a prop structure for this.
        const layers = [
            // [SearchResultLayer, { view: 'all' }],
            [LandmarksLayer, { view: 'all' }], 
            // [MapsDistributionLayer, { view: 'master' }],
            // [FootprintMapsLayer, { view: 'slave' }],
            // [MapsPolygonLayer, { view: 'master', onClick: this.showMapDetail.bind(this) }], 
            // [MapsLabelLayer, {view: 'master'}],
            // [MapsClusterCounts, {view: 'master'}],
            [MapsBitmapLayer, { id: 'crop', name: 'crop', suffix: 'uncrop', view: 'all', onClick: this.showMapDetail.bind(this) }],
            // [MapsBitmapLayer, { id: 'edge', name: 'edge', suffix: '_edge.png', view: 'slave', onClick: this.showMapDetail.bind(this) }],
            // [TileImagesLayer, {id: 'tile_crop', view: 'all',  suffix: 'crop', onClick: this.showMapDetail.bind(this)}]
        ];

        const { showModal, modalData } = this.state;
        // const {  }

        const { mode } = this.props;

        return (
            <React.Fragment>
                <ModalWindow
                    isOpen={showModal}
                    onRequestClose={() => this.setState({ showModal: false })}
                    {...modalData}
                />
                
                <Range></Range>

                <MapViewer
                    mode={mode}
                    layers={layers}
                ></MapViewer>




            </React.Fragment>
        )
    }
}

MapExplorer.contextType = MapDataContext;