import { loadImage } from '@loaders.gl/images'

export default class SpriteManager {
  constructor (gl, { onUpdate = () => { }, onSpriteLoaded = () => {} }) {
    this.gl = gl
    this.onUpdate = onUpdate
    this.onSpriteLoaded = onSpriteLoaded
    this.state = {
      atlas: {},
      images: [],
      atlasLoaded: false,
      atlasPending: false
    }
  }

  async loadAtlases ({ path, total, prefix = 'subdivisions_' }) {
    if (this.state.atlasLoaded || this.state.atlasPending) {
      // Ignore atlas is either in processing or already processed
      return
    } else {
      this.state.atlasPending = true
    }

    // 1. Build descriptors urls
    const descriptors = Array.from({ length: total }, (v, k) => `${path}${prefix}${k}.json`)

    // 2. Get descriptors data
    const data = await Promise.all(
      descriptors.map(async (url) => {
        const response = await fetch(url)
        return await response.json()
      })
    )

    // 3. Merge all descriptors and extract sprite filename
    const images = []
    const atlas = {}
    data.forEach((conf, idx) => {
      const filename = conf.filename
      // 3. Load image
      const imagePath = `${path}${filename}`
      images.push({ path: imagePath, index: idx })
      // 4. Parse frames
      Object.keys(conf.frames)
        .forEach(key => {
          atlas[key] = { ...conf.frames[key], filename, filenameIndex: idx }
        })
    })

    // 4. Load all sprites
    let imageLoadedCount = 0
    const sprites = await Promise.all(
      images.map(async ({ path, ...args }) => {
        const image = await loadImage(path).then((img) => {
          if (this.onSpriteLoaded) {
            imageLoadedCount = imageLoadedCount + 1
            this.onSpriteLoaded({
              total: images.length,
              path,
              index: imageLoadedCount
            })
          }
          return img
        })

        return { image, ...args }
      })
    )

    // Update state
    this.state = {
      ...this.state,
      atlasLoaded: true,
      atlasPending: false,
      atlas
    }

    // Notify layer that the sprites and descriptors are ready
    this.onUpdate(sprites)
  }

  getImageMapping (imageId) {
    if (this.state.atlas[imageId]) {
      return this.state.atlas[imageId] || {}
    } else {
      return {}
    }
  }
}
