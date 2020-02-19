import React, { Component } from 'react';
import OSD from 'openseadragon';

import styles from './Zoomable.module.scss'

export default class Zoomable extends Component { 

    render() {
        let { id } = this.props
        return (
            <React.Fragment>
                <div className={styles.openseadragon} ref={node => { this.el = node; }}>
                    <div className="navigator-wrapper c-shadow">
                        <div id="navigator"></div>
                    </div>
                    <div className={styles.container} id={id}></div>
                </div>
            </React.Fragment>
        )
    }

    initSeaDragon() {
        const { assetId } = this.props
        fetch(`${process.env.REACT_APP_TILED_IMAGE_BASE_URL}/${assetId}.tif/info.json`)
            .then((response) => response.json())
            .then((info) => {
                // Temporal solution until I implement an updated version of 
                // Loris or I use another IIIF server 
                info['@id'] = `${process.env.REACT_APP_TILED_IMAGE_BASE_URL}/${assetId}.tif`;
                
                // Create an instance of OSD
                const { id } = this.props;
                try {
                    this.viewer = OSD({
                        id: id,
                        visibilityRatio: 1.0,
                        constrainDuringPan: false,
                        defaultZoomLevel: 1,
                        minZoomLevel: 1,
                        maxZoomLevel: 10,
                        showNavigator: false,
                        tileSources: [
                            info
                        ]
                    })
                } catch (error) {
                    console.warn(error);
                }

        
            })



    }

    componentDidMount() {
        this.initSeaDragon()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false
    }
}

Zoomable.defaultProps = { id: 'ocd-viewer', type: 'legacy-image-pyramid' }