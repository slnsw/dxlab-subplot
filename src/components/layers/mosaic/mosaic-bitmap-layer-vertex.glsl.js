export default `
#define SHADER_NAME mosaic-bitmap-layer-vertex-shader

attribute vec2 vertices;
attribute vec2 texCoords;
attribute vec3 color;
attribute float instanceIds;
attribute float vertexId;

attribute vec3 bounds;
attribute vec2 bounds64xyLow;

attribute vec4 boundX; 
// attribute vec4 boundX64xyLow;
attribute vec4 boundY; 
// attribute vec4 boundY64xyLow;
attribute vec4 boundZ; 
// attribute vec4 boundZ64xyLow;

attribute float offsetZ;
attribute vec4 imageFrame;
attribute float imageRotated;

attribute vec3 pickingColors;
attribute float opacities;

uniform vec2 uTextureDim;

varying vec3 vColor;
varying vec2 vUV;
varying float vOpacities;


void main() {
    // color_setColor(color);

    // See https://stackoverflow.com/questions/19529690/index-expression-must-be-constant-webgl-glsl-error
    int i = int(vertexId);
    vec3 position = vec3(1.0);
    // vec3 bound64xyLow = vec3(1.0);
    if(i == 0) {
        position = vec3(boundX.x, boundY.x, boundZ.x + offsetZ);
        // bound64xyLow = vec3(boundX64xyLow.x, boundY64xyLow.x, boundZ64xyLow.x);
    }else if(i == 1) {
        position = vec3(boundX.y, boundY.y, boundZ.y + offsetZ);
        // bound64xyLow = vec3(boundX64xyLow.y, boundY64xyLow.y, boundZ64xyLow.y);
    }else if(i == 2) {
        position = vec3(boundX.z, boundY.z, boundZ.z + offsetZ);
        // bound64xyLow = vec3(boundX64xyLow.z, boundY64xyLow.z, boundZ64xyLow.z);
    }else if(i == 3) {
        position = vec3(boundX.w, boundY.w, boundZ.w + offsetZ);
        // bound64xyLow = vec3(boundX64xyLow.w, boundY64xyLow.w, boundZ64xyLow.w);
    }


    geometry.worldPosition = position;
    geometry.uv = texCoords;
    geometry.pickingColor = pickingColors;

    gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);




    // geometry.worldPosition = bounds;
    // geometry.uv = texCoords;
    // gl_Position = project_position_to_clipspace(bounds, bounds64xyLow, vec3(0.0), geometry.position);
    // gl_Position = project_position_to_clipspace(positions, vec2(0.0), vec3(0.0), geometry.position);
    // DECKGL_FILTER_GL_POSITION(gl_Position, geometry);



    // Calculate uv rotation if required
    vec2 uv = texCoords;
    if (imageRotated == 1.0) {
        float radAngle = radians(-90.0);
        uv = texCoords + vec2(-0.5, -0.5);
        uv = mat2(cos(radAngle), sin(radAngle), -sin(radAngle), cos(radAngle)) * uv;
        uv = uv + vec2(0.5, 0.5);
    } 

    vUV = mix(imageFrame.xy, imageFrame.xy + imageFrame.zw, uv) / uTextureDim;
    vColor = color;
    
    vec4 color = vec4(0.0);
    DECKGL_FILTER_COLOR(color, geometry);

    // Instance opacity
    vOpacities = opacities;
    
}
`
