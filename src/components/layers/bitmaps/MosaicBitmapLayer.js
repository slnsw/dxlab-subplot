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
  imageMapping: { type: 'object', value: null, async: true },
  data: { type: 'array', value: [], async: true },

  alphaCutoff: { type: 'number', value: 0.05, min: 0, max: 1 },

  getBounds: { type: 'accessor', value: x => x.bounds },
  getImage: { type: 'accessor', value: x => x.image },
  getColor: { type: 'accessor', value: x => x.color },

  desaturate: { type: 'number', min: 0, max: 1, value: 0 },
  // Inspired by  Deck.gl BitmapLayer implementation
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
        update: this.calculatePositions,
        transition: true,
        divisor: 1,
      },
      boundY: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        transition: true,
        divisor: 1
      },
      boundZ: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        transition: true,
        divisor: 1
      },
      bounds: {
        size: 3,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        accessor: 'getBounds',
        update: this.calculatePositions,
        transition: true,
        divisor: 1,
        defaultValue: [0, 0, 0],
        // transform: this.trnBounds
      },
      color: {
        size: 3,
        accessor: 'getColor',
        divisor: 1
      },
      textureMapping: { 
        size: 4, 
        accessor: 'getImage',
        divisor: 1, 
        transform: this.getTextureMapping 
      }
    });
    /* eslint-enable max-len */

    this.state = {
      boundX: [],
      boundY: [],
      boundZ: [],
      bounds: [],
      positionCalculated: false
    };
  }



  trnBounds(coords) {
    const positions = [];
    // [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]
    for (let i = 0; i < coords.length; i++) {
      positions[i * 3 + 0] = coords[i][0];
      positions[i * 3 + 1] = coords[i][1];
      positions[i * 3 + 2] = coords[i][2] || 0;
    }

    return positions;
  }


  calculatePositions(attribute, { data, numInstances }) {
    const { calculatePositions } = this.state;

    // Split bounds only ones
    // Wierd solution but when I assing the values directly 
    // to the attribute they are not pass to the vertex shader
    if (!calculatePositions) {
      const bounds = [];
      const boundX = [];
      const boundY = [];
      const boundZ = [];

      const { getBounds } = this.props;
      data.forEach((item, j) => {
        let coords = getBounds(item);

        coords.forEach((point, i) => {
          boundX.push(point[0]);
          boundY.push(point[1]);
          boundZ.push(point[2] || 0);
        });

        coords = this.trnBounds(coords);
        bounds.push(...coords);
      });

      this.state = {
        ...this.state,
        boundX,
        boundY,
        boundZ,
        bounds,
        calculatePositions: true
      }
    }

    const values = this.state[attribute.id];
    attribute.value = new Float32Array(values);

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

    if (props.imageAtlas !== oldProps.imageAtlas) {
      this.loadTexture(props.imageAtlas);
    }

    const attributeManager = this.getAttributeManager();

    if (props.data !== oldProps.data) {
      attributeManager.invalidate('bounds');
      attributeManager.invalidate('boundX');
      attributeManager.invalidate('boundY');
      attributeManager.invalidate('boundZ');
      this.state = { ...this.state, calculatePositions: false }
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
          attributes: {
            texCoords: { size: 2, type: GL.FLOAT, value: texCoords },
            vertices: { size: 2, type: GL.FLOAT, value: vertices },
            vertexId: { size: 1, type: GL.FLOAT, value: vertexIds },
            // positions: {
            //   size: 3, type: GL.FLOAT, value: new Float32Array(this.trnBounds([
            //     [151.214204, -33.864048],
            //     [151.210451, -33.864039],
            //     [151.210455, -33.859921],
            //     [151.214208, -33.859929]
            //   ]))
            // }
          }
        }),
        // isInstanced: true,
        vertexCount: 4,
        instanced: true
      })
    );
  }

  draw(opts) {
    const { uniforms } = opts;
    const { model, texture } = this.state;

    model
      .setUniforms({
        ...uniforms,
        uTexture: texture,
        uTextureDim: new Float32Array([1024, 1657])

      })
      .draw();
  }


  loadTexture(imageAtlas) {
    const { gl } = this.context;
    const texture = new Texture2D(gl, {
      data: imageAtlas,
      parameters: DEFAULT_TEXTURE_PARAMETERS
    })
    this.setState({ texture });
  }

  count = 0;

  getTextureMapping(imageId) {
    const rect = this.props.imageMapping[this.count % 5]
    this.count++;
    return [rect.x || 0, rect.y || 0, rect.w || 0, rect.h || 0];
  }



}

MosaicBitmapLayer.layerName = 'MosaicBitmapLayer';
MosaicBitmapLayer.defaultProps = defaultProps;

