
import { CompositeLayer } from 'deck.gl';
import { BitmapLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';

import { getImageUrl, interpolateScale } from '../../share/utils';

import { load } from "@loaders.gl/core";
import { max, min, get } from 'lodash'
import { scaleLinear } from 'd3-scale';

// Experimental
import bearing from '@turf/bearing';

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

      const { filters } = this.props;
      const { fromYear, toYear } = filters;

      const scaleElevation = scaleLinear([fromYear, toYear], [0,  toYear - fromYear])

      const featuresData = data.reduce(function (result, el) {
        const { geometry, properties } = el;
        if (geometry) {
          // const elevation = 0;

          //interpolateScale(parseInt(properties.year), toYear, fromYear) * 50;
          const elevation = Math.floor(scaleElevation(parseInt(properties.year))) * 100;
          //  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);

          const image = getImageUrl(properties.asset_id, suffix, '16');
          const feature = {
            ...el,
            geometry: {
              ...geometry,
              coordinates: [geometry.coordinates[0].map((c) => ([...c, elevation]))]
            },
            properties: {
              ...properties,
              elevation,
              image_url: image,
              // IMPORTANT: Change image bound structure to a single array
              // Deck.gl API needs image bounds in a single array. 
              image_bounds: properties.image_bounds.coordinates[0].map((c) => ([...c, elevation])),
              centroid: [...properties.centroid.coordinates, elevation],
              // bearing: bearing(properties.image_bounds.coordinates[0][0], properties.image_bounds.coordinates[0][1]),
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

  shouldUpdateState({ changeFlags }) {
    return ( changeFlags.viewportChanged !== false || changeFlags.dataChanged || changeFlags.propsChanged);
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


  buildLayers() {
    const { id, name, contextState, suffix } = this.props;
    const { feature: { features } } = this.state;
    const layers = [];


    const zoom = this.context.viewport.zoom;
    const lod = [8, 16, 32, 64, 128, 512] //, 1024]
    const scale = scaleLinear([4, 18], [0, lod.length - 1])

    // TODO: Decouple this context from this layer. Option inject focus via props
    const inFocus = get(contextState, 'maps.focus.properties.asset_id', null)
    // const inFocusYear = get(contextState, 'maps.focus.properties.year', null)

    layers.push(new GeoJsonLayer(this.getSubLayerProps({
      id: `${id}-bitmap-layer-${name}-cutlines`,
      data: this.state.feature,
      extruded: false,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      material: {
        ambient: 0.35,
        diffuse: .6,
        shininess: 32,
        specularColor: [30, 30, 30]
      },
      getLineWidth: 3,
      getFillColor: [255, 255, 255, 125],
      getLineColor: [255, 255, 255, 255],
      // getLineColor: (d) => {
      //   const currYear = get(d, 'properties.year', null);
      //   const opacity =  (currYear > inFocusYear)? 0 : 255;
      //   return [255, 255, 255, opacity]
      // },
      // getFillColor: (d) => {
      //   const currYear = get(d, 'properties.year', null);
      //   const opacity =  (currYear > inFocusYear)? 0 : 125;
      //   return [255, 255, 255, opacity]
      // },
      // updateTriggers: {
      //   getFillColor: [inFocus]
      // },
      // transitions: {
      //   getFillColor: 300
      // }

    })));

    layers.push(new TextLayer(this.getSubLayerProps({
      id: `${id}-bitmap-label-${suffix}`,
      data: features,
      pickable: false,
      billboard: true,
      getSize: 16,
      sizeScale: 20 / 16,

      fontWeight: 800,
      fontFamily: 'Lekton',
      getPixelOffset: [0, -10, 0],
      getColor: (d) => {
        const opacity = (zoom < 13.5 || !inFocus || inFocus === d.properties.asset_id) ? 0 : 255;
        return [255, 255, 255, opacity]
      },

      // autoHighlight: true,
      // getAngle: (d) => d.properties.bearing,
      getText: (d) => (d.properties.year.toString()),
      getPosition: (d) => d.properties.centroid,
      updateTriggers: {
        getColor: [zoom, inFocus]
      },
      transitions: {
        getColor: 300
      }

    })));


    const viewportRect = this.getViewBounds()
    const visible = features.filter(({ properties: { image_bounds, year } }) => areRectanglesOverlap(viewportRect, this.getImageBounds(image_bounds))) 

    layers.push(visible.map(({ properties: { asset_id, image_bounds, elevation } }) => {

      const size = Math.floor(scale(zoom + (elevation / 100) ))
      let image_url = getImageUrl(asset_id, suffix, lod[size]);

      let opacity = 1;
      if (inFocus) {
        opacity = (asset_id && (inFocus === asset_id)) ? 1 : .05;
        image_url = getImageUrl(asset_id, suffix, 1024);
      }

      return new BitmapLayer(this.getSubLayerProps({
        id: `${id}-bitmap-layer-${name}-${asset_id}`,
        bounds: image_bounds,
        opacity: opacity,
        pickable: false,
        autoHighlight: false,
        image: image_url,
        material: {
          ambient: 0.35,
          diffuse: .6,
          shininess: 32,
          specularColor: [30, 30, 30]
        },
        parameters: {
          // Prevent png alpha channel create artifacts when overlaping other pngs
          depthMask: false,
        },
      }));

    }));



    return layers;

  }


  renderLayers() {
    return this.buildLayers();
    // return this.loadImages();
  }


  // Testing alternative loading
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
        // console.log('visible')
        setTimeout(() => {
          load(url).then((r) => {
            // console.log('loaded', r.src);
            resolve(r)
          }).catch((err) => {
            // console.log(err);
            reject(err)
          })
        }
          , 5000);
        // resolve()
      } else {
        // console.log('hidden')
        resolve(null)
      }
    })

  }


}

TileImagesLayer.layerName = 'TileImageLayer';
