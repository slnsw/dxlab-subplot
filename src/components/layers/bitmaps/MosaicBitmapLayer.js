import GL from '@luma.gl/constants';
import { Layer } from '@deck.gl/core';
import { Model, Geometry, Texture2D } from '@luma.gl/core';

import vs from './mosaic-bitmap-layer-vertex.glsl';
import fs from './mosaic-bitmap-layer-fragment.glsl';

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const defaultProps = {
  imageAtlas: { type: 'object', value: null, async: true },
  data: { type: 'array', value: [], async: true },
  // bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
  alphaCutoff: { type: 'number', value: 0.05, min: 0, max: 1 },

  getBounds: { type: 'accessor', value: x => x.bounds },
  getImage: { type: 'accessor', value: x => x.image },

  desaturate: { type: 'number', min: 0, max: 1, value: 0 },
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: { type: 'color', value: [0, 0, 0, 0] },
  tintColor: { type: 'color', value: [255, 255, 255] }
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export class MosaicBitmapLayer extends Layer {
  getShaders() {
    return super.getShaders({ vs, fs, modules: ['project32'] }); // 'picking'
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager.add({
      boundX: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: () => { },
        transition: true,
        divisor: 0
      },
      boundY: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: () => { },
        transition: true,
        divisor: 0
      },
      boundZ: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: () => { },
        transition: true,
        divisor: 0
      },
      bounds: {
        size: 3,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        accessor: 'getBounds', //this.getBounds,
        update: this.calculatePositions,
        transition: true,
        divisor: 0,
        defaultValue: [0, 0, 0],
        transform: this.trnBounds
      }
      // instanceTextureMapping: {size: 4, accessor: 'getImage', transform: this.getTextureMapping}
    });
    /* eslint-enable max-len */
  }



  trnBounds(bounds) {
    const positions = [];
    // [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]
    for (let i = 0; i < bounds.length; i++) {
      positions[i * 3 + 0] = bounds[i][0];
      positions[i * 3 + 1] = bounds[i][1];
      positions[i * 3 + 2] = bounds[i][2] || 0;
    }

    return positions;
  }


  transformBound(coordinate) {
    return (bounds) => {
      const bound = [];

      for (let i = 0; i < bounds.length; i++) {
        bound.push(bounds[i][coordinate] || 0);
      }

      console.log(coordinate, bound);

      return new Float64Array(bound);
    };
  }

  calculatePositions(attribute, { data, numInstances }) {
    const attributeManager = this.getAttributeManager();
    const { boundX, boundY, boundZ } = attributeManager.getAttributes();

    const values = [];
    const valuesX = [];
    const valuesY = [];
    const valuesZ = [];

    const { getBounds } = this.props;
    data.forEach((item, j) => {
      let bounds = getBounds(item);
  
      bounds.forEach((point, i) => {
        valuesX.push(point[0]);
        valuesY.push(point[1]);
        valuesZ.push(point[2] || 0);
      });

      bounds = this.trnBounds(bounds);
      values.push(...bounds);
    });

    attribute.value = new Float32Array(values);
    boundX.value = new Float32Array(valuesX);
    boundY.value = new Float32Array(valuesY);
    boundZ.value = new Float32Array(valuesZ);

    console.log(valuesX)

  }




  updateState({ props, oldProps, changeFlags }) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({ model: this._getModel(gl) });
      this.getAttributeManager().invalidateAll();
    }

    // if (props.image !== oldProps.image) {
    //   this.loadTexture(props.image);
    // }

    const attributeManager = this.getAttributeManager();

    if (props.data !== oldProps.data) {
      attributeManager.invalidate('bounds');
    }
  }

  finalizeState() {
    super.finalizeState();

    // if (this.state.bitmapTexture) {
    //   this.state.bitmapTexture.delete();
    // }
  }

  _getModel(gl) {
    if (!gl) {
      return null;
    }

    /*
    -1,1 ---- 1,1
     |        |
    -1,-1 --- 1,-1
    */
    const vertices = new Float32Array([
      -1, -1, // Left - Bottom
      -1, 1, // Left - Top
      1, 1,  // Right - Top 
      1, -1  // Right - Bottom

    ])

    /*
    0,0 --- 1,0
    |       |
    0,1 --- 1,1
    */
    const texCoords = new Float32Array([
      0, 1, // 0, 1 
      0, 0, // 0, 0 
      1, 0, // 1, 0
      1, 1 // 1, 1
    ])
    // END: Geometry attributes


    // Create and ID for each vertex so we can access the right vertex position
    const vertexIds = new Float32Array([0, 1, 2, 3]);

    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          isInstanced: true,
          instanceCount: 2,
          vertexCount: 4,
          attributes: {
            texCoords: { size: 2, type: GL.FLOAT, value: texCoords },
            vertices: { size: 2, type: GL.FLOAT, value: vertices },
            vertexId: { size: 1, type: GL.FLOAT, value: vertexIds },
            // vertices: {
            //   size: 3, type: GL.FLOAT, value: new Float32Array(this.trnBounds([
            //     [151.214204, -33.864048],
            //     [151.210451, -33.864039],
            //     [151.210455, -33.859921],
            //     [151.214208, -33.859929]
            //   ]))
            // }
          }
        }),
        isInstanced: true
      })
    );
  }

  draw(opts) {
    this.state.model.draw();
  }


}

MosaicBitmapLayer.layerName = 'MosaicBitmapLayer';
MosaicBitmapLayer.defaultProps = defaultProps;

