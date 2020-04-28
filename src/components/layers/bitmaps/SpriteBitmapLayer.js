import GL from '@luma.gl/constants';
import {Layer} from '@deck.gl/core';
import {Model, Geometry, Texture2D} from '@luma.gl/core';

import vs from './sprite-bitmap-layer-vertex.glsl';
import fs from './sprite-bitmap-layer-fragment.glsl';

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  image: {type: 'object', value: null, async: true},
  mapping: {type: 'object', value: {}, async: true},

  getPosition: {type: 'accessor', value: x => x.position},
  getImage: {type: 'accessor', value: x => x.image},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export class SpriteBitmapLayer extends Layer {
  getShaders() {
    return super.getShaders({vs, fs, modules: ['project32', 'picking']});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.add({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition',
        update: this.preparePositions,
        // noAlloc,
        shaderAttributes: {
          positions: {
            offset: 0,
            divisor: 0
          },
          instancePositions: {
            offset: 0,
            divisor: 1
          },
          nextPositions: {
            offset: 12,
            divisor: 1
          }
        }
      },
      instanceImageFrames: {size: 4, accessor: 'getImage', transform: this.getInstanceIconFrame},
      instanceColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR
      },
    });

  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    const attributeManager = this.getAttributeManager();

    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      attributeManager.invalidateAll();
    }

    // // setup model first
    // if (changeFlags.extensionsChanged) {
    //   const {gl} = this.context;
    //   if (this.state.model) {
    //     this.state.model.delete();
    //   }
    //   this.setState({model: this._getModel(gl)});
    //   this.getAttributeManager().invalidateAll();
    // }

    // if (props.image !== oldProps.image) {
    //   this.loadTexture(props.image);
    // }

    // const attributeManager = this.getAttributeManager();

    // if (props.bounds !== oldProps.bounds) {
    //   attributeManager.invalidate('positions');
    // }
  }

  finalizeState() {
    super.finalizeState();

    // if (this.state.bitmapTexture) {
    //   this.state.bitmapTexture.delete();
    // }
  }


  _getModel(gl) {
    console.log('model..')
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
          vertexCount: 12,
          attributes: {
            texCoords: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]),
            // positions:  new Float32Array([-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0])
          }
        }),
        // instanceCount: 2,
        // isInstanced: true
      })
    );
  }


  preparePositions(attributes) {
    const {data} = this.props;
    const positions = [];
    for (let j = 0; j < data.length; j++) {
      let bounds = data[j];
      let offset = positions.length;

      for (let i = 0; i < bounds.length; i++) {
        positions[offset + i * 3 + 0] = bounds[i][0];
        positions[offset + i * 3 + 1] = bounds[i][1];
        positions[offset + i * 3 + 2] = bounds[i][2] || 0;
      }
    }
    attributes.values = positions;
  }
  

  getInstanceImageFrame(image) {
    console.log(image)
    const rect = {x: 0, y: 0, width: 10, height: 10};
    return [rect.x || 0, rect.y || 0, rect.width || 0, rect.height || 0];
  }

}

SpriteBitmapLayer.layerName = 'SpriteBitmapLayer';
SpriteBitmapLayer.defaultProps = defaultProps;
