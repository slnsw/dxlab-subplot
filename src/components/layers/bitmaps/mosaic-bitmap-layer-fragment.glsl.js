export default `
#define SHADER_NAME mosaic-bitmap-layer-fragment-shader

uniform sampler2D uTexture;

varying vec2 vUV;
varying vec3 vColor;


void main() {
    // Color render
    // gl_FragColor = vec4(vec3(1.0, 1.0, 0.0), 1.0);
    // gl_FragColor = vec4(vColor, 1.0);
    
    // Just render texture
    // vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    // gl_FragColor = texColor;

    // Load texture option 1
    vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    vec4 aColor = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 color = mix(texColor.rgb, aColor.rgb, 0.0);
    float a = texColor.a * 1.0 * aColor.a;

    if (a < 0.05) {
        discard;
    }

    gl_FragColor = vec4(color, a); 


    // // Load texture option 2
    // vec4 texColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
    // vec4 aColor = vec4(0.0, 0.0, 0.0, 1.0);
    // vec4 color = mix(aColor, vec4(texColor.rgb, 1.0), texColor.a * 0.8);
    // gl_FragColor = color;
}
`
