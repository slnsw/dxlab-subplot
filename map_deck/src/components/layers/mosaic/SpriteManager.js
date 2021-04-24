import { loadImage } from '@loaders.gl/images'

export default class SpriteManager {
  constructor (gl, { onUpdate = () => { }, onSpriteLoaded = () => {} }) {
    this.gl = gl
    this.onUpdate = onUpdate
    this.onSpriteLoaded = onSpriteLoaded
    this.useWebp = false
    this.state = {
      atlas: {},
      images: [],
      atlasLoaded: false,
      atlasPending: false
    }
    this.check_webp_feature('lossy', (...args) => { this.useWebp = args[0] })
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
        if (this.useWebp) {
          path = path.replace('.png', '.webp')
        }
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

  // https://developers.google.cn/speed/webp/faq?hl=zh-cn#how_can_i_detect_browser_support_for_webp
  // check_webp_feature:
  //   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
  //   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
  check_webp_feature (feature, callback) {
    var kTestImages = {
      lossy: 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      lossless: 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
      alpha: 'UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==',
      animation: 'UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA'
    }
    var img = new Image()
    img.onload = function () {
      var result = (img.width > 0) && (img.height > 0)
      callback(feature, result)
    }
    img.onerror = function () {
      callback(feature, false)
    }
    img.src = 'data:image/webp;base64,' + kTestImages[feature]
  }

  getImageMapping (imageId) {
    if (this.state.atlas[imageId]) {
      return this.state.atlas[imageId] || {}
    } else {
      return {}
    }
  }
}
