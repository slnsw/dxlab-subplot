import { AmbientLight, DirectionalLight, LightingEffect } from '@deck.gl/core'

// create ambient light source
const ambientLight = new AmbientLight({
  color: [255, 0, 255],
  intensity: 1.0

})
// create point light source
// const pointLight = new PointLight({
//   color: [255, 255, 255],
//   intensity: 2.0,
//   // use coordinate system as the same as view state
//   position: [-125, 50.5, 5000]
//   // _shadow: true
// })

// create directional light source
const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 0.5,
  direction: [0, 0, 0],
  _shadow: true
})

class MyLightingEffect extends LightingEffect {
  preRender (gl, { layers, ...params }) {
    // eslint-disable-next-line
    layers = layers.filter((l) => (l.props.castShadow !== null ? true : l.props.castShadow))
    return super.preRender(gl, { layers, ...params })
  }
}

// create lighting effect with light sources
const lightingEffect = new MyLightingEffect({ ambientLight, directionalLight })

// console.log(lightingEffect);

lightingEffect.shadowColor = [0, 0, 0, 0.5]

export default lightingEffect
