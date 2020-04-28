import GL from '@luma.gl/constants';
import {Layer} from '@deck.gl/core';
import {Model, Geometry, Texture2D} from '@luma.gl/core';

import vs from './mosaic-bitmap-layer-vertex.glsl';
import fs from './mosaic-bitmap-layer-fragment.glsl';

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const defaultProps = {
  image: {type: 'object', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]}
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export class MosaicBitmapLayer extends Layer {
  getShaders() {
    return super.getShaders({vs, fs, modules: ['project32', 'picking']});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.add({
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        noAlloc: true
      }
    });

    this.setState({
      numInstances: 1,
      positions: new Float64Array(12)
    });
  }

  updateState({props, oldProps, changeFlags}) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }

    if (props.image !== oldProps.image) {
      this.loadTexture(props.image);
    }

    const attributeManager = this.getAttributeManager();

    if (props.bounds !== oldProps.bounds) {
      attributeManager.invalidate('positions');
    }
  }

  finalizeState() {
    super.finalizeState();

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }
  }

  calculatePositions(attributes) {
    console.log('calculate')
    const {positions} = this.state;
    const {bounds} = this.props;
    // bounds as [minX, minY, maxX, maxY]
    if (Number.isFinite(bounds[0])) {
      /*
        (minX0, maxY3) ---- (maxX2, maxY3)
               |                  |
               |                  |
               |                  |
        (minX0, minY1) ---- (maxX2, minY1)
     */
      positions[0] = bounds[0];
      positions[1] = bounds[1];
      positions[2] = 0;

      positions[3] = bounds[0];
      positions[4] = bounds[3];
      positions[5] = 0;

      positions[6] = bounds[2];
      positions[7] = bounds[3];
      positions[8] = 0;

      positions[9] = bounds[2];
      positions[10] = bounds[1];
      positions[11] = 0;
    } else {
      // [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]
      for (let i = 0; i < bounds.length; i++) {
        positions[i * 3 + 0] = bounds[i][0];
        positions[i * 3 + 1] = bounds[i][1];
        positions[i * 3 + 2] = bounds[i][2] || 0;
      }
    }

    attributes.value = positions;
  }

  _getModel(gl) {
    if (!gl) {
      return null;
    }

    /*
      0,1 --- 1,1
       |       |
      0,0 --- 1,0
    */
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertexCount: 4,
          attributes: {
            texCoords: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0])
          }
        }),
        isInstanced: false
      })
    );
  }

  draw(opts) {
    const {uniforms} = opts;
    const {bitmapTexture, model} = this.state;
    const {image, desaturate, transparentColor, tintColor} = this.props;

    // Update video frame
    if (
      bitmapTexture &&
      image instanceof HTMLVideoElement &&
      image.readyState > HTMLVideoElement.HAVE_METADATA
    ) {
      const sizeChanged =
        bitmapTexture.width !== image.videoWidth || bitmapTexture.height !== image.videoHeight;
      if (sizeChanged) {
        // note clears image and mipmaps when resizing
        bitmapTexture.resize({width: image.videoWidth, height: image.videoHeight, mipmaps: true});
        bitmapTexture.setSubImageData({
          data: image,
          paramters: DEFAULT_TEXTURE_PARAMETERS
        });
      } else {
        bitmapTexture.setSubImageData({
          data: image
        });
      }

      bitmapTexture.generateMipmap();
    }

    // // TODO fix zFighting
    // Render the image
    if (bitmapTexture && model) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            bitmapTexture,
            desaturate,
            transparentColor: transparentColor.map(x => x / 255),
            tintColor: tintColor.slice(0, 3).map(x => x / 255)
          })
        )
        .draw();
    }
  }

  loadTexture(image) {
    const {gl} = this.context;

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    if (image instanceof Texture2D) {
      this.setState({bitmapTexture: image});
    } else if (image instanceof HTMLVideoElement) {
      // Initialize an empty texture while we wait for the video to load
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          width: 1,
          height: 1,
          parameters: DEFAULT_TEXTURE_PARAMETERS,
          mipmaps: false
        })
      });
    } else if (image) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          data: image,
          parameters: DEFAULT_TEXTURE_PARAMETERS
        })
      });
    }
  }
}

MosaicBitmapLayer.layerName = 'MosaicBitmapLayer';
MosaicBitmapLayer.defaultProps = defaultProps;

// // Mosaic image layer
// import GL from '@luma.gl/constants';
// import { Model, Buffer, Geometry, CubeGeometry } from '@luma.gl/core';

// // import {Layer, project32, picking} from '@deck.gl/core';
// import { Layer } from '@deck.gl/core';
// import { BitmapLayer } from '@deck.gl/layers';

// import vs from './mosaic-bitmap-layer-vertex.glsl.js';
// import fs from './mosaic-bitmap-layer-fragment.glsl.js'; 


// // const DEFAULT_TEXTURE_PARAMETERS = {
// //   [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
// //   [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
// //   [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
// //   [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
// // };

// // const defaultProps = {
// //     // Center of each circle, in [longitude, latitude, (z)]
// //     getPosition: {type: 'accessor', value: x => x.position},
// //     // Radius of each circle, in meters 
// //     getRadius: {type: 'accessor', value: 1},
// //     // Color of each circle, in [R, G, B, (A)]
// //     getColor: {type: 'accessor', value: [0, 0, 0, 255]},
// //     // Amount to soften the edges
// //     smoothRadius: {type: 'number', min: 0, value: 0.5},
// // }

// export class MosaicBitmapLayer extends Layer {

//   getShaders() {
//     return super.getShaders({ vs, fs, modules: ['project32', 'picking'] });
//   }


//   initializeState() {
//     const {gl} = this.context;

//     // // Register attributes
//     // this.getAttributeManager().addInstanced({
//     //   instancePositions: {
//     //     size: 3,
//     //     type: gl.DOUBLE,
//     //     accessor: 'getPosition'
//     //   },
//     //   instanceRadius: {
//     //     size: 1,
//     //     accessor: 'getRadius',
//     //     defaultValue: 1
//     //   },
//     //   instanceColors: {
//     //     size: 4,
//     //     normalized: true,
//     //     type: gl.UNSIGNED_BYTE,
//     //     accessor: 'getColor',
//     //     defaultValue: [0, 0, 0, 255]
//     //   }
//     // });
    

//     // Save the model in layer state
//     this.setState({
//       model: this.getModel(gl)
//     });
//   }

//   updateState() {
//     const { gl } = this.context;
//     this.setState({ model: this.getModel(gl) });
//   }


//   // _getModel(gl) {
//   //   if (!gl) {
//   //     return null;
//   //   }
//   //   // Four corners of the quad
//   //   const positions = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);

//   //   return new Model(
//   //     gl,
//   //     Object.assign({}, this.getShaders(), {
//   //       id: this.props.id,
//   //       geometry: new Geometry({
//   //         drawMode: gl.TRIANGLE_FAN,
//   //         vertexCount: 4,
//   //         attributes: {
//   //           positions: { size: 2, value: positions }
//   //         }
//   //       }),
//   //       isInstanced: true
//   //     })
//   //   );
//   // }


//   // getModel(gl) {
//   //   // Four corners of the quad
//   //   const positions = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);
//   //   const geometry = new Geometry({
//   //     drawMode: gl.TRIANGLE_FAN,
//   //     vertexCount: 4,
//   //     attributes: {
//   //       positions: {size: 2, value: positions}
//   //     }
//   //   });
//   //   return new Model(gl, {vs, fs, geometry, isInstanced: true});
//   // }

//   getModel(gl) {

//     // Four corners of the quad
//     // const positionBuffer = new Buffer(gl, new Float32Array([
//     //   -0.5, -0.5,
//     //   0.5, -0.5,
//     //   0.0, 0.5
//     // ]));

//     const positionBuffer = new Buffer(gl, new Float32Array(
//       [ 151.214204, -33.864048, 
//         151.210451, -33.864039, 
//         151.210455, -33.859921, 
//         151.214208, -33.859929
//       ]));

//     const colorBuffer = new Buffer(gl, new Float32Array([
//       1.0, 0.0, 0.0,
//       0.0, 1.0, 0.0,
//       0.0, 0.0, 1.0,
//       0.0, 0.0, 0.0
//     ]));

//     const attributes = {
//       positions: positionBuffer,
//       color: colorBuffer
//     }
//     return new Model(gl, {vs, fs, attributes, vertexCount:3});
//   }




// } 

// MosaicBitmapLayer.layerName = 'MosaicBitmapLayer';
// // MosaicBitmapLayer.defaultProps = defaultProps;


// /*

// data = {
//   const DEGREE_TO_RADIANS = Math.PI / 180;
//   let r = 0;
//   let a = 0;
//   return new Array(1976).fill(0).map(_ => {
//     const cosA = Math.cos(a * DEGREE_TO_RADIANS);
//     const sinA = Math.sin(a * DEGREE_TO_RADIANS);
//     const radius = Math.pow(0.96, r);
//     const dist = (1 - radius * 6) * 150;
//     const p = {
//       size: radius * radius * 20,
//       position: [cosA * dist, sinA * dist],
//       color: [(cosA + 1) / 2 * 255, (sinA + 1) / 2 * 255, 128]
//     };
    
//     a += 360 / (r * 6 + 1);
//     if (a > 359.99) {
//       a = 0;
//       r++;
//     }
    
//     return p;
//   });
// }
// */