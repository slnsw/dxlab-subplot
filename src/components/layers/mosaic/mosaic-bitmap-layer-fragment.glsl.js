export default `
#define SHADER_NAME mosaic-bitmap-layer-fragment-shader


#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexture;
// uniform sampler2D uTextures[1];

uniform float opacity;
uniform float debugging;

varying vec2 vUV;
varying vec3 vColor;
varying float vOpacities; 


void main() {
    // Color render
    // gl_FragColor = vec4(vec3(1.0, 1.0, 0.0), 0.5);
    // gl_FragColor = vec4(vColor, vOpacities);
    
    // Just render texture with opacity
    vec4 texColor = texture2D(uTexture, vUV.xy); 
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

    // For debuging if color is transparent change to defined color.
    // It helps to identify images that haven't load
    // if(color == vec4(0.0)) {
    //     color = vec4(vColor, vOpacities);
    // }
    // gl_FragColor = color; 

    // // vec4 col = texture2D(uTexture, vUV.xy); 
    // // gl_FragColor = col;
    // vec4 texColor = texture2D(uTextures[0], vUV.xy);  
    // // vec4 texColor = vec4(vec3(1.0, 1.0, 0.0), 1.0);
    // // gl_FragColor = texColor;
    // // Apply opacity
    // vec4 color = mix(vec4(0.0), vec4(texColor.rgb, 1.0), texColor.a * vOpacities);



    // geometry.uv = vUV;
    // DECKGL_FILTER_COLOR(gl_FragColor, geometry);


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

    geometry.uv = vUV;
    DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`
