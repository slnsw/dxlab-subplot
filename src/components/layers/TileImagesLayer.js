
import {CompositeLayer} from 'deck.gl';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers'; 

import { load } from "@loaders.gl/core";
    
export class TileImagesLayer extends CompositeLayer {



    searchAreaLayer() {
        const tileServer = 'https://collections.dma.org/media/tiled-images/75586461932257_pyramid.ptif_files'
        // 'https://collections.dma.org/media/tiled-images/75586461932257_pyramid.ptif_files/12/1_4.jpg'


        return new TileLayer({
            pickable: false,
            opacity: 1,
            // https://wiki.openstreetmap.org/wiki/Zoom_levels
            // minZoom: 0,
            // maxZoom: 13,
    
            getTileData: ({ x, y, z }) => {
              console.log(x,y,z);
              return Promise.resolve(null);
              //load(`${tileServer}/${z}/${x}_${y}.jpg`),
            },
    
            renderSubLayers: props => {
              const {
                bbox: { west, south, east, north }
              } = props.tile;
    
              return null;
              // return new BitmapLayer(props, {
              //   data: [],
              //   image: "http://localhost:5004/a1367540_crop.png/full/full/0/gray.png",
              //   bounds: [[151.214204,-33.864048,50],[151.210451,-33.864039,50],[151.210455,-33.859921,50],[151.214208,-33.859929,50]]
              // });
            }
          })
    }

    lodImages() {
        const image = "http://dxmap.dimaginarium.com/tiled/a1367540_crop.png/full/200,/0/default.png";
        return new BitmapLayer({
            id: `lod-image`,
            bounds: [[151.214204,-33.864048,50],[151.210451,-33.864039,50],[151.210455,-33.859921,50],[151.214208,-33.859929,50]],
            opacity: 1,
            pickable: false,
            autoHighlight: false,
            image: image
        });
    }
    
 
    
    renderLayers() { 
        // return this.searchAreaLayer();
        return this.lodImages();
    }

}

TileImagesLayer.layerName = 'SearchResultLayer';