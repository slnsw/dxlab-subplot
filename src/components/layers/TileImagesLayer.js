
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers';

import { getImageUrl } from '../../share/utils';

import { load } from "@loaders.gl/core";
import { max, min } from 'lodash'



const areRectanglesOverlap = (a, b) => {
  const visible = !(
    b.left < a.left ||
    b.top < a.top ||
    b.right > a.right ||
    b.bottom > a.bottom
  )

  return visible
}

let promise = null

export class TileImagesLayer extends CompositeLayer {



  updateState({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data, suffix } = props;

      if (!data) {
        return;
      }

      const featuresData = data.reduce(function (result, el) {
        const { geometry, properties } = el;
        if (geometry) {
          const elevation = 50;
          //  const { filter} = this.props;
          //  const { fromYear, toYear } = filter;
          //  const elevation = interpolateScale(parseInt(m.year), toYear, fromYear) * 50; 
          //  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);

          const image = getImageUrl(properties.asset_id, suffix, '128');
          const feature = {
            ...el,
            geometry: {
              ...geometry,
              coordinates: [geometry.coordinates[0].map((c) => {
                c.push(elevation);
                return c;
              })]
            },
            properties: {
              ...properties,
              elevation,
              image_url: image,
              // IMPORTANT: Change image bound structure to a single array
              // Deck.gl API needs image bounds in a single array. 
              image_bounds: properties.image_bounds.coordinates[0].map((c) => {
                c.push(elevation);
                return c;
              }),

            }
          }

          result.push(feature);
        }
        return result;
      }, []);

      const feature = {
        'type': 'FeatureCollection',
        'features': featuresData

      }
      this.setState({ feature });

    }
  }

  shouldUpdateState({ props, oldProps, context, oldContext, changeFlags }) {
    return (changeFlags.viewportChanged !== false || changeFlags.dataChanged);
  }



  getImageBounds(bounds) {
    const points = bounds.map(p => this.context.viewport.project(p))
    const longs = points.map((c) => c[0])
    const lats = points.map((c) => c[1])

    // console.log(points)

    const left = max(longs)
    const right = min(longs)
    const top = max(lats)
    const bottom = min(lats)
    return { top, right, bottom, left }

  }

  getViewBounds() {
    const viewport = this.context.viewport
    return { top: 0, right: viewport.width, bottom: viewport.height, left: 0 }
  }

  loadImages() {
    const tileServer = 'http://dxmap.dimaginarium.com/tiled/'

    // [[west, south], [west, north], [east, north], [east, south], [west, south]]
    // const bounds = [[151.214204, -33.864048, 50], [151.210451, -33.864039, 50], [151.210455, -33.859921, 50], [151.214208, -33.859929, 50]]
    const bounds = [[151.214204, -33.864048], [151.210451, -33.864039], [151.210455, -33.859921], [151.214208, -33.859929]]


    const z = this.context.viewport.zoom
    const height = 4493
    const width = 6495
    const tileWidth = 256
    const tileHeight = 256
    const minZoom = 0
    const maxZoom = 13

    const scale = Math.ceil(Math.pow(0.5, maxZoom - z))

    const iiifTileSizeWidth = Math.ceil(tileWidth / scale);
    const iiifTileSizeHeight = Math.ceil(tileHeight / scale);


    // 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096
    // 
    const image = `${tileServer}a1367540.tif/full/4096,/0/default.png`
    const inViewport = areRectanglesOverlap(this.getViewBounds(), this.getImageBounds(bounds));

    // let cancel = null
    // promise = new Promise((resolve, reject) => {
    //   cancel = reject;
    //   if (inViewport) {
    //     console.log('visible')
    //     setTimeout(() => {
    //       load(image).then((r) => {
    //         console.log('loaded', r.src);
    //         resolve(r)
    //       }).catch((err) => {
    //         // console.log(err);
    //         reject(err)
    //       })
    //     }
    //       , 5000);
    //     // resolve()
    //   } else {
    //     console.log('hidden')
    //     resolve(null)
    //   }
    // })

    // console.log(cancel);
    // setTimeout(() => {
    //   console.log('cancel'); 
    //   promise.catch(()=> {})
    //   cancel()
    // }, 2000)

    // console.log(promise)

    return [
      (inViewport && [new BitmapLayer({
        id: `lod-image`,
        bounds: bounds,
        opacity: 1,
        pickable: false,
        autoHighlight: false,
        image: load(image)
      })]),
    ];
  }


  loadImage(url, inViewport) {
    let cancel = null
    return new Promise((resolve, reject) => {
      cancel = reject;
      if (inViewport) {
        console.log('visible')
        setTimeout(() => {
          load(url).then((r) => {
            console.log('loaded', r.src);
            resolve(r)
          }).catch((err) => {
            // console.log(err);
            reject(err)
          })
        }
          , 5000);
        // resolve()
      } else {
        console.log('hidden')
        resolve(null)
      }
    })

  }

  buildLayers() {
    const { id, name } = this.props;
    const { feature: { features } } = this.state;
    const layers = [];

    // layers.push(features.map(({ properties: { asset_id, image_bounds, image_url } }) => {

    //   return new BitmapLayer(this.getSubLayerProps({
    //     id: `${id}-bitmap-layer-${name}-${asset_id}`,
    //     bounds: image_bounds,
    //     opacity: 0.8,
    //     pickable: false,
    //     autoHighlight: false,
    //     image: image_url
    //   }));

    // }));

    const viewportRect = this.getViewBounds()
    const visible = features.filter(({ properties: { image_bounds } }) => areRectanglesOverlap(viewportRect, this.getImageBounds(image_bounds)))

    layers.push(visible.map(({ properties: { asset_id, image_bounds, image_url } }) => {
      console.log(image_url)


      return new BitmapLayer(this.getSubLayerProps({
        id: `${id}-bitmap-layer-${name}-${asset_id}`,
        bounds: image_bounds,
        opacity: 0.8,
        pickable: false,
        autoHighlight: false,
        image: image_url
      }));

    }));


    layers.push(new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-bitmap-layer-${name}-cutlines`,
      data: this.state.feature,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      getFillColor: [0, 0, 0, 0],
      getLineColor: [0, 0, 0, 125],

    })));

    return layers;

  }


  renderLayers() {
    return this.buildLayers();
    // return this.loadImages();
  }

}

TileImagesLayer.layerName = 'TileImageLayer';
