export default `
#define SHADER_NAME mosaic-bitmap-layer-fragment-shader


#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexture;
uniform float opacity;

varying vec2 vUV;
varying vec3 vColor;
varying float vOpacities;


void main() {
    // Color render
    // gl_FragColor = vec4(vec3(1.0, 1.0, 0.0), 1.0);
    // gl_FragColor = vec4(vColor, 1.0);
    
    // Just render texture with opacity
    vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    // gl_FragColor = texColor;
    // opacity
    gl_FragColor = mix(vec4(0.0), vec4(texColor.rgb, 1.0), texColor.a * vOpacities);
    
    geometry.uv = vUV;
    DECKGL_FILTER_COLOR(gl_FragColor, geometry);

    // Load texture option 1 ( needs to be fix )
    // vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    // vec4 aColor = vec4(0.0, 0.0, 0.0, 1.0);
    // vec3 color = mix(texColor.rgb, aColor.rgb, 0.0);
    // float a = texColor.a * 1.0 * aColor.a;

    // if (a < 0.05) {
    //     discard;
    // }

    // gl_FragColor = vec4(color, a); 


    // // Load texture option 2
    // vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    // vec4 aColor = vec4(0.0, 0.0, 0.0, 1.0);
    // vec4 color = mix(aColor, vec4(texColor.rgb, 1.0), texColor.a * 0.8);
    // gl_FragColor = color;
}
`
