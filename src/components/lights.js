import {AmbientLight, PointLight, DirectionalLight, LightingEffect} from '@deck.gl/core';

// create ambient light source
const ambientLight = new AmbientLight({
  color: [255, 0, 255],
  intensity: 1.0,

});
// create point light source
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  // use coordinate system as the same as view state
  position: [-125, 50.5, 5000],
  // _shadow: true
});

// create directional light source
const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: .5,
  direction: [0, 0, 0],
  _shadow: true
});


class MyLightingEffect extends LightingEffect {

  // preRender
  prepare(gl, {layers, ...params}) {
    // layers = layers.filter((l) => (l.props.material))
    return super.prepare(gl, {layers, ...params})
  }
}


// create lighting effect with light sources
const lightingEffect = new MyLightingEffect({ ambientLight, directionalLight});

// console.log(lightingEffect);

lightingEffect.shadowColor = [0, 0, 0, .3];

export default lightingEffect;