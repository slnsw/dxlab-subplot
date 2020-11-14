import GL from '@luma.gl/constants'
import { Layer, project32, picking } from '@deck.gl/core'
import { Model, Geometry, Texture2D, withParameters } from '@luma.gl/core' // ProgramManager

import vs from './sprite-bitmap-layer-vertex.glsl'
import fs from './sprite-bitmap-layer-fragment.glsl'
import SpriteManager from './SpriteManager'

import { range } from 'lodash'

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST, // GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST, // GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
}

const defaultProps = {
  imageAtlas: { type: 'object', value: null, async: true },
  imageMapping: { type: 'object', value: {}, async: true },
  data: { type: 'array', value: [], async: true },

  alphaCutoff: { type: 'number', value: 0.05, min: 0, max: 1 },

  getBounds: { type: 'accessor', value: x => x.bounds },
  getImage: { type: 'accessor', value: x => x.image },
  getColor: { type: 'accessor', value: x => x.color },
  getOpacity: { type: 'accessor', value: x => x.opacity || 1 },
  getOffsetZ: { type: 'accessor', value: x => x.offsetZ || 0 },

  desaturate: { type: 'number', min: 0, max: 1, value: 0 },
  // Inspired by  Deck.gl BitmapLayer implementation
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: { type: 'color', value: [0, 0, 0, 0] },
  tintColor: { type: 'color', value: [255, 255, 255] }
}

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export class SpriteBitmapLayer extends Layer {
  getShaders () {
    // Looks like Luma.gl the WebGL deck.gl uses is not
    // capable of load Array of sampler2D. For that reason
    // I fallback to old school generation in runtime of the a fragment
    // shader and taking advantage of Luma shader modules
    // NOTE: props.sprites is the number of images that are required to load
    // technically a shader has a limit of sample2D variables so maybe in the future
    // multiple shaders will be required to load
    const texIndex = range(0, this.props.sprites)
    const textureShaderModule = {
      name: 'textures',
      fs: `
        ${texIndex.map(i => `
        uniform sampler2D uTexture${i};`
        ).join('')}

        vec4 texture_getColor(float index, vec2 pos) { 
          int i = int(index);
          ${texIndex.map(i => `
          if( i == ${i}) {
            // return vec4(1.0, 0.${i}, 0.0, 1.0);
            return texture2D(uTexture${i}, pos); 
          } 
          `).join('')}
          return vec4(1.0, 0.5, 0.0, 1.0);
        }
      `
    }

    return super.getShaders({ vs, fs, modules: [project32, picking, textureShaderModule] }) // 'picking'
  }

  initializeState () {
    const attributeManager = this.getAttributeManager()

    attributeManager.remove(['instancePickingColors'])

    /* eslint-disable max-len */
    attributeManager.add({
      boundX: {
        size: 4,
        type: GL.FLOAT,
        // fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        transition: true,
        divisor: 1
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
        defaultValue: [0, 0, 0]
        // transform: this.trnBounds
      },
      offsetZ: {
        size: 1,
        type: GL.FLOAT,
        accessor: 'getOffsetZ',
        transition: true,
        divisor: 1
      },
      color: {
        size: 3,
        accessor: 'getColor',
        divisor: 1
      },
      imageFrame: {
        size: 4,
        accessor: 'getImage',
        divisor: 1,
        transform: this.getImageFrame
      },
      // imageFrameSize: {
      //   size: 2,
      //   accessor: 'getImage',
      //   divisor: 1,
      //   transform: this.getImageFrameSize
      // },
      imageRotated: {
        size: 1,
        accessor: 'getImage',
        divisor: 1,
        transform: this.getImageRotated
      },
      imageIndex: {
        size: 1,
        type: GL.FLOAT,
        accessor: 'getImage',
        divisor: 1,
        transform: this.getImageIndex
      },
      opacities: {
        size: 1,
        type: GL.FLOAT,
        accessor: 'getOpacity',
        divisor: 1
      },
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: (object, { index, target: value }) => {
          return this.encodePickingColor(object && object.__source ? object.__source.index : index, value)
        },
        divisor: 1
      }
    })
    /* eslint-enable max-len */

    this.setState({
      boundX: [],
      boundY: [],
      boundZ: [],
      bounds: [],
      calculatePositions: true,
      spriteManager: new SpriteManager(this.context.gl, { onUpdate: (images) => this.onManagerUpdate(images) })
    })
  }

  trnBounds (coords) {
    const positions = []
    // [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]
    for (let i = 0; i < coords.length; i++) {
      positions[i * 3 + 0] = coords[i][0]
      positions[i * 3 + 1] = coords[i][1]
      positions[i * 3 + 2] = coords[i][2] || 0
    }

    return positions
  }

  calculatePositions (attribute, { data, numInstances }) {
    const { calculatePositions } = this.state
    // Split bounds only ones
    // Weird solution but when I assign the values directly
    // to the attribute they are not pass to the vertex shader
    if (calculatePositions) {
      const bounds = []
      const boundX = []
      const boundY = []
      const boundZ = []

      const { getBounds } = this.props
      data.forEach((item, j) => {
        let coords = getBounds(item)

        coords.forEach((point, i) => {
          boundX.push(point[0])
          boundY.push(point[1])
          boundZ.push(point[2] || 0)
        })

        coords = this.trnBounds(coords)
        bounds.push(...coords)
      })

      this.setState({
        boundX,
        boundY,
        boundZ,
        bounds,
        calculatePositions: false
      })
    }
    const values = this.state[attribute.id]
    attribute.value = new Float32Array(values)
  }

  updateState ({ props, oldProps, changeFlags }) {
    // console.log('update', changeFlags)

    // setup model first
    const { spriteManager, spriteUpdated = false } = this.state
    const attributeManager = this.getAttributeManager()

    if (changeFlags.extensionsChanged) {
      const { gl } = this.context
      if (this.state.model) {
        this.state.model.delete()
      }
      this.setState({ model: this._getModel(gl) })
      this.getAttributeManager().invalidateAll()
    }

    if (props.path !== oldProps.path ||
        props.sprite !== oldProps.sprites ||
        props.prefix !== oldProps.prefix
    ) {
      spriteManager.loadAtlases({ path: props.path, total: props.sprites, prefix: props.prefix })
    }

    if (spriteUpdated) {
      attributeManager.invalidate('imageFrame')
      attributeManager.invalidate('imageRotated')
      attributeManager.invalidate('imageIndex')
      this.setState({ spriteUpdated: false })
    }

    if (props.data !== oldProps.data) {
      attributeManager.invalidateAll()
      this.setState({ calculatePositions: true })
    }
  }

  finalizeState () {
    super.finalizeState()

    // if (this.state.bitmapTexture) {
    //   this.state.bitmapTexture.delete();
    // }
  }

  _getModel (gl) {
    if (!gl) {
      return null
    }

    /*
    0,0 --- 1,0
    |       |
    0,1 --- 1,1
    */
    const texCoords = new Float32Array([
      1, 0,
      1, 1,
      0, 1,
      0, 0
    ])

    // Create and ID for each vertex so we can access the right vertex position
    const vertexIds = new Float32Array([0, 1, 2, 3])
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            texCoords: { size: 2, type: GL.FLOAT, value: texCoords },
            vertexId: { size: 1, type: GL.FLOAT, value: vertexIds }
          }
        }),
        // isInstanced: true,
        vertexCount: 4,
        instanced: true
      })
    )
  }

  draw (opts) {
    const { uniforms } = opts
    const { model, sprites = [], spriteSize = new Float32Array([0, 0]) } = this.state

    // Temporally disable depthMask to help to prevent zFighting of
    // overlapping images with alpha channels. eg PNG
    const { gl } = this.context
    withParameters(gl, {
      blend: true,
      depthMask: false,
      depthTest: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      blendEquation: GL.FUNC_ADD
    }, () => {
      model
        .setUniforms({
          ...uniforms,
          debugging: false,
          ...sprites,
          uTextureDim: spriteSize

        })
        .draw()
    })
  }

  onManagerUpdate (textures) {
    const { gl } = this.context
    const sprites = {}
    textures.forEach(({ image, index }) => {
      sprites[`uTexture${index}`] = new Texture2D(gl, {
        data: image,
        mipmaps: false,
        parameters: DEFAULT_TEXTURE_PARAMETERS
      })
    })

    // Get dimensions from first sprite
    const texture = sprites.uTexture0
    let spriteSize = new Float32Array([0, 0])
    if (texture) {
      spriteSize = new Float32Array([texture.width, texture.height])
    }

    this.setState({ sprites, spriteSize, spriteUpdated: true })
    // console.log('ready', textures.length)
    // Force update model
    this.setNeedsUpdate()
  }

  loadTexture (imageAtlas) {
    const { gl } = this.context
    const texture = new Texture2D(gl, {
      data: imageAtlas,
      mipmaps: false,
      parameters: DEFAULT_TEXTURE_PARAMETERS
    })

    this.setState({ texture })
  }

  getImageFrame (imageId) {
    const rect = this.state.spriteManager.getImageMapping(imageId)
    return [rect.x || 0, rect.y || 0, rect.w || 0, rect.h || 0]
  }

  getImageRotated (imageId) {
    const { rotated } = this.state.spriteManager.getImageMapping(imageId)
    return (rotated) ? 1 : 0
  }

  getImageIndex (imageId) {
    const { filenameIndex } = this.state.spriteManager.getImageMapping(imageId)
    // console.log(filenameIndex)
    return filenameIndex || 0
  }

  // getImageFrameSize (imageId) {
  //   const { spriteSize } = this.state.spriteManager.getImageMapping(imageId)
  //   return spriteSize || [0, 0]
  // }
}

SpriteBitmapLayer.layerName = 'SpriteBitmapLayer'
SpriteBitmapLayer.defaultProps = defaultProps
