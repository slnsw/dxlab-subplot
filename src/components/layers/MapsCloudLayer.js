
import { CompositeLayer } from 'deck.gl';
import { TextLayer, IconLayer } from '@deck.gl/layers';
import Supercluster from 'supercluster';

import { MosaicBitmapLayer } from './bitmaps/MosaicBitmapLayer';
import { SpriteBitmapLayer } from './bitmaps/SpriteBitmapLayer';

const ICON_MAPPING = {
    "marker": {
        "x": 0,
        "y": 0,
        "width": 512,
        "height": 512,
        "anchorY": 128
    }
}

// "filename": "a1358001_crop_512.png",
// "frame": {"x":0,"y":0,"w":512,"h":371},
// "rotated": false,
// "trimmed": false,
// "spriteSourceSize": {"x":0,"y":0,"w":512,"h":371},
// "sourceSize": {"w":512,"h":371}


export class MapsCloudLayer extends CompositeLayer {



    buildLayers() {
        const { id, name } = this.props;
        const { cluster } = this.state;

        const layers = [];


        const il = new IconLayer(this.getSubLayerProps({
            id: `${id}-layer-${name}-icon-cluster-count`,
            data: [{ 'la': 1 }],
            iconAtlas: 'map_sheet.png',
            iconMapping: ICON_MAPPING,
            billboard: false,
            sizeScale: 400,
            material: true,
            getPosition: d => [
                151.212477,
                -33.861994
            ],
            getIcon: d => 'marker', // getIconName(d.properties.cluster ? d.properties.point_count : 1),
            getSize: d => 1 // this.getIconSize(d.properties.cluster ? d.properties.point_count : 1)

        }));

        // layers.push(il);

        // MosaicBitmapLayer
        const bounds = [
            [[151.214204, -33.864048], [151.210451, -33.864039], [151.210455, -33.859921], [151.214208, -33.859929]],
            [[151.201436, -33.883678], [151.201835, -33.885401], [151.20147, -33.885425], [151.201071, -33.883702]]
        ]

        const mb = new MosaicBitmapLayer(this.getSubLayerProps({
            id: `${id}-bitmap-layer-mosaic`,

            bounds: bounds[0],
            // opacity: opacity,
            pickable: false,
            autoHighlight: false,
            image: 'map_sheet.png',
            material: false,
            // material: {
            //   ambient: 0.35,
            //   diffuse: .6,
            //   shininess: 32,
            //   specularColor: [30, 30, 30]
            // },
            parameters: {
                // Prevent png alpha channel create artifacts when overlaping other pngs
                //   depthMask: false,
            },
        }));

        // layers.push(mb);

        const sp = new SpriteBitmapLayer(this.getSubLayerProps({
            id: `${id}-bitmap-layer-sprite`,
            image: 'map_sheet.png',
            data: bounds,
            mapping: {
                "map1": {
                    "x": 0,
                    "y": 0,
                    "width": 512,
                    "height": 512,
                    "anchorY": 128
                },
                "map2": {
                    "x": 512,
                    "y": 0,
                    "width": 512,
                    "height": 512,
                    "anchorY": 128
                }
            },
            getPosition: (d) => [...d],
            getImage: (d) => 'map1',
            getColor: (d) => [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), 255]

        }));

        layers.push(sp);

        return layers;

    }


    renderLayers() {
        return this.buildLayers();
    }


}

MapsCloudLayer.layerName = 'MapsCloudLayer';
