
import { CompositeLayer } from 'deck.gl'
import { TextLayer, IconLayer } from '@deck.gl/layers'
import Supercluster from 'supercluster'

import { MosaicBitmapLayer } from './bitmaps/MosaicBitmapLayer'
import { SpriteBitmapLayer } from './bitmaps/SpriteBitmapLayer'

const ICON_MAPPING = {
  marker: {
    x: 0,
    y: 0,
    width: 512,
    height: 512,
    anchorY: 128
  }
}

// "filename": "a1358001_crop_512.png",
// "frame": {"x":0,"y":0,"w":512,"h":371},
// "rotated": false,
// "trimmed": false,
// "spriteSourceSize": {"x":0,"y":0,"w":512,"h":371},
// "sourceSize": {"w":512,"h":371}

export class MapsCloudLayer extends CompositeLayer {
  updateState ({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data } = props

      if (!data) {
        return
      }

      // Load maps data
      const mosaicData = data.reduce(function (result, el) {
        const { geometry, properties } = el
        // if (geometry) {
        // if (properties.asset_id === 'a9613015') {
        result.push({
          bounds: properties.image_bounds.coordinates[0].map((c) => [...c]),
          image: properties.asset_id,
          color: [1.0, 0, 0]
        })
        // }

        // }
        return result
      }, [])

      this.setState({ mosaicData })

      // `${process.env.REACT_APP_SPRITE_MAPING_PATH}`
      // ()['/sprites/subdivisions_']

      // fetch(`${process.env.REACT_APP_SPRITE_MAPING_PATH}`)
      // // We get the API response and receive data in JSON format...
      // .then(response => response.json())
    }
  }

  buildLayers () {
    const { id, name } = this.props
    const { cluster } = this.state

    const layers = []

    // const il = new IconLayer(this.getSubLayerProps({
    //     id: `${id}-layer-${name}-icon-cluster-count`,
    //     data: [{ 'la': 1 }],
    //     iconAtlas: 'map_sheet.png',
    //     iconMapping: ICON_MAPPING,
    //     billboard: false,
    //     sizeScale: 400,
    //     material: true,
    //     getPosition: d => [
    //         151.212477,
    //         -33.861994
    //     ],
    //     getIcon: d => 'marker', // getIconName(d.properties.cluster ? d.properties.point_count : 1),
    //     getSize: d => 1 // this.getIconSize(d.properties.cluster ? d.properties.point_count : 1)

    // }));

    // layers.push(il);

    // MosaicBitmapLayer
    // const bounds = [
    //     [[151.214204, -33.864048], [151.210451, -33.864039], [151.210455, -33.859921], [151.214208, -33.859929]],
    //     [[151.201436, -33.883678], [151.201835, -33.885401], [151.20147, -33.885425], [151.201071, -33.883702]]
    // ]

    /*
        const atlas2 = {
            0: { x: 0, y: 0, w: 512, h: 371 },
            1: { x: 512, y: 0, w: 512, h: 371 },
            2: { x: 0, y: 371, w: 512, h: 428 },
            3: { x: 512, y: 371, w: 512, h: 430 },
            4: { x: 0, y: 801, w: 512, h: 430 },
        }
        */
    /* const atlas = {
            "frames": {
                // 0: {"frame": {"x": 92, "y": 1562, "w": 95, "h": 128}, "size": {"w": 128, "h": 95}, "rotated": true, "offset": {"x": 0, "y": 0}},
                // 0:  {"frame": {"x": 1541, "y": 1027, "w": 383, "h": 512}, "size": {"w": 512, "h": 383}, "rotated": true, "offset": {"x": 0, "y": 0}},
                0: {
                    "frame": {
                        "x": 1842,
                        "y": 1172,
                        "w": 106,
                        "h": 128
                    },
                    "size": {
                        "w": 128,
                        "h": 106
                    },
                    "rotated": true,
                    "offset": {
                        "x": 0,
                        "y": 0
                    }
                },
                1: {
                    "frame": {
                        "x": 209,
                        "y": 132,
                        "w": 104,
                        "h": 128
                    },
                    "size": {
                        "w": 128,
                        "h": 104
                    },
                    "rotated": true,
                    "offset": {
                        "x": 0,
                        "y": 0
                    }
                },
                2: {
                    "frame": {
                        "x": 108,
                        "y": 522,
                        "w": 106,
                        "h": 128
                    },
                    "size": {
                        "w": 128,
                        "h": 106
                    },
                    "rotated": true,
                    "offset": {
                        "x": 0,
                        "y": 0
                    }
                },
                3: {
                    "frame": {
                        "x": 678,
                        "y": 1302,
                        "w": 107,
                        "h": 128
                    },
                    "size": {
                        "w": 128,
                        "h": 107
                    },
                    "rotated": true,
                    "offset": {
                        "x": 0,
                        "y": 0
                    }
                },
            }
        } */

    // const mosaicData = [
    //     {
    //         image: '001',
    //         bounds: [[151.214204, -33.864048], [151.210451, -33.864039], [151.210455, -33.859921], [151.214208, -33.859929]],
    //         color: [0, 0, 1]
    //         // bounds: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [ 1.0, 1.0, 0.0]],
    //         // bounds: [151.214204, -33.864048, 0, 151.210451, -33.864039, 0, 151.210455, -33.859921, 0, 151.214208, -33.859929, 0]
    //     },
    //     {
    //         image: '002',
    //         bounds:  [[151.201436, -33.883678], [151.201835, -33.885401], [151.20147, -33.885425], [151.201071, -33.883702]],
    //         color: [1, 0, 0]
    //     },
    // ];

    const { mosaicData } = this.state

    const mb = new MosaicBitmapLayer(this.getSubLayerProps({
      id: `${id}-bitmap-layer-mosaic`,

      data: mosaicData,
      opacity: 0.5,
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 255, 0, 125],
      // imageAtlas: [
      //     'sprites/subdivisions_0.png',
      //     'sprites/subdivisions_1.png'
      // ],
      // imageMapping: [
      //     'sprites/subdivisions_0.json',
      //     'sprites/subdivisions_1.json'
      // ],

      imageAtlas: 'sprites/subdivisions_2.png',
      imageMapping: 'sprites/subdivisions_20.json',
      getOpacity: d => Math.random() * (1 - 0.5) + 0.5,
      getOffsetZ: d => Math.random() * (500 - 0) + 0,

      material: false,

      getBounds: (d) => d.bounds,
      parameters: {
        // Prevent png alpha channel create artifacts when overlapping other pngs
        depthMask: false
      }

    }))

    layers.push(mb)

    // const sp = new SpriteBitmapLayer(this.getSubLayerProps({
    //     id: `${id}-bitmap-layer-sprite`,
    //     image: 'map_sheet.png',
    //     bounds: bounds[0],
    //     getImage: (d) => 'map1',
    //     getColor: (d) => [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), 255]

    // }));

    // layers.push(sp);

    return layers
  }

  renderLayers () {
    return this.buildLayers()
  }
}

MapsCloudLayer.layerName = 'MapsCloudLayer'
