import { loadImage } from '@loaders.gl/images'

export default class MosaicManager {
  constructor (gl, { onUpdate = () => {} }) {
    this.gl = gl
    this.onUpdate = onUpdate
    this.state = {
      atlas: {},
      images: [],
      atlasLoaded: false
    }
  }

  loadAtlases () {
    // Load mapping data
    // TODO: Should I move this to getMaps action?

    // Expand const regex = /\{(\d+)-(\d+)\}/gm;
    const from = 0
    const to = 4
    const spritePath = '/sprites/128/'
    const urls = Array.from({ length: (to + 1) - from }, (v, k) => `${spritePath}subdivisions_${k + from}.json`)

    if (this.state.atlasLoaded) {
      return
    }

    Promise.all(
      urls.map(url =>
        fetch(url)
          .then(response => response.json())
          .catch(() => { console.error(`can not load ${url}`) })
      )
    ).then((data) => {
      // Parse all individuals mappings into a single index
      const images = []
      const atlas = data.reduce((result, conf) => {
        const filename = conf.filename
        images.push(`${spritePath}/${filename}`)
        Object.keys(conf.frames)
          .forEach(key => {
            result[key] = { ...conf.frames[key], filename }
          })

        return result
      }, {})
      return { atlas, images }
    }).then(({ atlas, images }) => {
      this.state = {
        ...this.state,
        atlasLoaded: true,
        atlas,
        images
      }

      // Load images found in the atlases
      this.loadImages(images)
    })
  }

  loadImages (urls) {
    Promise.all(
      urls.map(url =>
        loadImage(url)
          .then(response => response)
          .catch(() => { console.error(`can not load ${url}`) })
      )
    ).then(data => {
      console.log(data)
      this.onUpdate()
    })
  }

  getImageMapping (imageId) {
    // console.log(imageId, this.state.atlas[imageId])
    if (this.state.atlas[imageId] && this.state.atlas[imageId].filename === 'subdivisions_4.png') {
      return this.state.atlas[imageId] || {}
    } else {
      return {}
    }
    // return this.state.atlas[imageId] || {}
  }
}
