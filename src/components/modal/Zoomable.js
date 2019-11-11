import React, { Component } from 'react';
import OSD from 'openseadragon';

export default class Zoomable extends Component {

    render() {
        let { id } = this.props
        return (
            <React.Fragment>
                <div className="ocd-div" ref={node => { this.el = node; }}>
                    <div className="navigator-wrapper c-shadow">
                        <div id="navigator"></div>
                    </div>
                    <div className="openseadragon" id={id} style={{ 'width': '100vw', 'height': '80vh' }}></div>
                </div>
            </React.Fragment>
        )
    }

    initSeaDragon() {
        let { id, assetId } = this.props
        this.viewer = OSD({
            id: id,
            visibilityRatio: 1.0,
            constrainDuringPan: false,
            defaultZoomLevel: 1,
            minZoomLevel: 1,
            maxZoomLevel: 10,
            showNavigator: true,
            tileSources: [{
                "profile": [
                    "http://iiif.io/api/image/2/level2.json",
                    {
                        "supports": [
                            "canonicalLinkHeader",
                            "profileLinkHeader",
                            "mirroring",
                            "rotationArbitrary",
                            "sizeAboveFull"
                        ],
                        "qualities": [
                            "default",
                            "color",
                            "gray",
                            "bitonal"
                        ],
                        "formats": [
                            "jpg",
                            "png",
                            "gif",
                            "webp"
                        ]
                    }
                ],
                "protocol": "http://iiif.io/api/image",
                "sizes": [

                ],
                "height": 4493,
                "width": 6495,
                "@context": "http://iiif.io/api/image/2/context.json",
                "@id": `${process.env.REACT_APP_STATIC_BASE_URL}${assetId}_crop.png`
            }
            ]
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