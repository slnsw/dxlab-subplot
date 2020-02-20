
import React, { Component } from 'react';
import { MapDataContext } from '../context/MapsContext';

import { MapViewer } from './MapViewer';


// UI Components
import { ModalWindow } from './ui/modal/ModalWindow';
import { Range } from './ui/range/Range';
import { Header } from './ui/header/Header';


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

import { showDetailMap, focusMap, removeFocusMap } from '../context/MapsActions';
import { get } from 'lodash';



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

            this.setState({
                modalData: { title, image_url, asset_id },
                selectedMap: object,
                showModal: true
            });

            // Update map context to keep track with the selected map
            dispatch(showDetailMap({ asset_id }))
        }
    };

    onHover({ object, x, y }) {
        const [, dispatch] = this.context;
        if (object) {
            // Update map context to keep track of map in focus
            dispatch(focusMap({
                ...object,
                mouseX: x,
                mouseY: y
            }))
        } else {
            dispatch(removeFocusMap())
        }
    }


    render() {
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
            // [MapsDistributionLayer, { view: 'master' }],
            [FootprintMapsLayer, { view: 'all' }],
            // [MapsPolygonLayer, { view: 'master',  ...handlers }], 
            // [MapsLabelLayer, {view: 'master'}],
            // [MapsClusterCounts, {view: 'master'}],
            // [MapsBitmapLayer, { id: 'crop', name: 'crop', suffix: 'crop', view: 'all', ...handlers  }],
            // [MapsBitmapLayer, { id: 'edge', name: 'edge', suffix: '_edge.png', view: 'slave', ...handlers }],
            [TileImagesLayer, { id: 'tile_crop', view: 'master', suffix: 'crop', ...handlers }]
        ];

        const { showModal, modalData, selectedMap = {} } = this.state;
        const { properties = {} } = selectedMap

        const { mode } = this.props;
        const [state,] = this.context;
        const data = get(state, 'maps.data', [])

        return (
            <React.Fragment>
                <ModalWindow
                    isOpen={showModal}
                    onRequestClose={() => this.setState({ showModal: false })}
                    {...modalData}
                    info={properties}
                />

                {data.length > 0 &&
                    <React.Fragment>
                        <Header />
                        <Range />
                    </React.Fragment>
                }
                <MapViewer
                    mode={mode}
                    layers={layers}
                ></MapViewer>




            </React.Fragment>
        )
    }
}

MapExplorer.contextType = MapDataContext;