
import { CompositeLayer } from 'deck.gl';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, PolygonLayer } from '@deck.gl/layers';

import { load } from "@loaders.gl/core";
import { max, min } from 'lodash'


const tileServer = 'http://dxmap.dimaginarium.com/tiled/'

// [[west, south], [west, north], [east, north], [east, south], [west, south]]
// const bounds = [[151.214204, -33.864048, 50], [151.210451, -33.864039, 50], [151.210455, -33.859921, 50], [151.214208, -33.859929, 50]]
const bounds = [[151.214204, -33.864048], [151.210451, -33.864039], [151.210455, -33.859921], [151.214208, -33.859929]]

const areRectanglesOverlap = (a, b) => {
  const visible = !(
      b.left < a.left ||
      b.top < a.top ||
      b.right > a.right ||
      b.bottom > a.bottom
    )

  return visible
}

export class TileImagesLayer extends CompositeLayer {




  shouldUpdateState({ props, oldProps, context, oldContext, changeFlags }) {

    // const visible = areRectanglesOverlap(this.getViewBounds(), this.getImageBounds());

    // this.setState({visible})

    return (changeFlags.viewportChanged !== false );
  }

  loadTileImages() {

    // 1. Load iif info.json file and extract height and with
    // Temporal
    const height = 4493
    const width = 6495
    const tileWidth = 256
    const tileHeight = 256
    const minZoom = 0
    const maxZoom = 13

    // const viewport = this.context.viewport
    // const nw = viewport.unproject([0, 0]);
    // const se = viewport.unproject([viewport.width, viewport.height]);

    // console.log(nw, se)

    return new TileLayer({
      pickable: false,
      opacity: 1,
      // https://wiki.openstreetmap.org/wiki/Zoom_levels
      // minZoom: 0,
      // maxZoom: 13,

      getTileData: ({ x, y, z, ...others }) => {
        const scale = Math.pow(0.5, maxZoom - z)
        const levelWidth = Math.ceil(width * scale)
        const levelHeight = Math.ceil(height * scale)
        const iiifTileSizeWidth = Math.ceil(tileWidth / scale);
        const iiifTileSizeHeight = Math.ceil(tileHeight / scale);

        const iiifTileX = 0; // x * iiifTileSizeWidth;
        const iiifTileY = 0; // y * iiifTileSizeHeight;
        const iiifTileW = Math.min(iiifTileSizeWidth, width - iiifTileX);
        const iiifTileH = Math.min(iiifTileSizeHeight, height - iiifTileY);

        // console.log(this.context)

        // console.log(x,y,z);
        // console.count(z)
        // return Promise.resolve(null);

        // console.log(scale, levelWidth, levelHeight, iiifTileSizeWidth, iiifTileSizeHeight, iiifTileW, iiifTileH)

        // return load(`${tileServer}/a1367540.tif/${iiifTileX},${iiifTileY},${iiifTileW},${iiifTileH}/full/0/default.jpg`)
        // console.log(others);
        // [[west, south], [west, north], [east, north], [east, south], [west, south]]
        const imageWest = bounds[0][0]
        const imageNorth = bounds[1][1]
        const imageSouth = bounds[0][1]
        const imageEast = bounds[2][0]

        const { bbox: { west, north, east, south } } = others
        // console.log(areRectanglesOverlap([west, north, east, south], [imageWest, imageNorth, imageEast, imageSouth] ));


        return load(`${tileServer}/a1367540.tif/${iiifTileX},${iiifTileY},${iiifTileW},${iiifTileH}/full/0/default.jpg`)
        // return Promise.resolve(null);
      },

      renderSubLayers: props => {
        const {
          bbox: { west, south, east, north }
        } = props.tile;

        // return null;
        return new BitmapLayer(props, {
          opacity: .5,
          data: [],
          image: props.data,
          bounds: bounds
        });
      }
    })
  }


  getImageBounds() {
    const points = bounds.map( p => this.context.viewport.project(p))
    const longs = points.map((c) => c[0])
    const lats = points.map((c) => c[1])

    // console.log(points)

    const left = max(longs)
    const right = min(longs)
    const top = max(lats)
    const bottom = min(lats)
    return {top, right, bottom, left}

  }

  getViewBounds() {
    const viewport = this.context.viewport
    return {top: 100, right: viewport.width -100, bottom: viewport.height-100, left: 100}
  }

  loadImages() {
    const z = this.context.viewport.zoom
    const height = 4493
    const width = 6495
    const tileWidth = 256
    const tileHeight = 256
    const minZoom = 0
    const maxZoom = 13

    const scale = Math.pow(0.5, maxZoom - z)
    const levelWidth = Math.ceil(width * scale)
    const levelHeight = Math.ceil(height * scale)
    const iiifTileSizeWidth = Math.ceil(tileWidth / scale);
    const iiifTileSizeHeight = Math.ceil(tileHeight / scale);

    const iiifTileX = 0; // x * iiifTileSizeWidth;
    const iiifTileY = 0; // y * iiifTileSizeHeight;
    const iiifTileW = Math.min(iiifTileSizeWidth, width - iiifTileX);
    const iiifTileH = Math.min(iiifTileSizeHeight, height - iiifTileY);


    // console.log(z)
    // [[west, south], [west, north], [east, north], [east, south], [west, south]]
    // const viewport = this.context.viewport
    // const nw = viewport.unproject([100, 100]);
    // const ne = viewport.unproject([viewport.height - 100, 100]);
    // const se = viewport.unproject([viewport.width - 100, viewport.height - 100]);
    // const sw = viewport.unproject([100, viewport.height - 100]);


    // const boundsView = [
    //   [nw[0], nw[1]],
    //   [ne[0], ne[1]], 
    //   [se[0], se[1]], 
    //   [sw[0], sw[1]],
    //   [nw[0], nw[1]]
    // ]
    // console.log(boundsView)

    // const image = `${tileServer}/a1367540.tif/full/200,/0/default.jpg`;

    const visible = areRectanglesOverlap(this.getViewBounds(), this.getImageBounds());

    const image = load(`${tileServer}/a1367540.tif/full/${iiifTileSizeWidth},/0/default.jpg`)
    return [
        ( visible &&[new BitmapLayer({
          id: `lod-image`,
          bounds: bounds,
          opacity: 1,
          pickable: false,
          autoHighlight: false,
          image: image
        })]),

        // new PolygonLayer({
        //   id: `lod-image-bounds`,
        //   opacity: .2,
        //   data: [boundsView],
        //   getPolygon: d => d,
        // })
    ];
  }



  renderLayers() {
    // return this.loadTileImages();
    return this.loadImages();
  }

}

TileImagesLayer.layerName = 'SearchResultLayer';