export default `
#define SHADER_NAME sprite-bitmap-layer-fragment-shader


#ifdef GL_ES
precision highp float;
#endif

// NOTE: texture declarations are injected when loading model

uniform float opacity;
uniform float debugging;

varying vec2 vUV;
varying vec3 vColor;
varying float vOpacities; 
varying float vImageIndex;


void main() {

    // Just render texture with opacity
    vec4 texColor = texture_getColor(vImageIndex, vUV.xy);
    // Apply opacity
    vec4 color = mix(vec4(0.0), vec4(texColor.rgb, 1.0), texColor.a * vOpacities);

    // Ignore if color is transparent
    // The debug option allows to see what images are images to be loaded
    if(color == vec4(0.0)) {
        // For debuging if color is transparent change to defined color.
        if(debugging != 0.0) {
            color = vec4(vColor, vOpacities);
        }else{
            discard;
        }
    }

    gl_FragColor = color;

    geometry.uv = vUV;
    DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`
