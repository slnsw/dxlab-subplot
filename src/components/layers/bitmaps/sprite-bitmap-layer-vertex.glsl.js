export default `
#define SHADER_NAME mosaic-bitmap-layer-vertex-shader

// instanced geometry
attribute vec2 texCoords;
attribute vec2 positions;
// attribute vec2 positions64xyLow;

// instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64Low;
attribute vec3 nextPositions;
attribute vec4 instanceColors;
attribute vec4 instanceImageFrames;

attribute vec3 instancePickingColors;

varying vec2 vTexCoord;
varying vec4 vColor;
varying vec2 vPosition;

varying vec2 uv;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.worldPositionAlt = nextPositions;
  geometry.uv = positions;
  uv = positions;

  // vec2 pixelOffset = positions / 2.0 * 1.0 + vec2(0.0);
  // vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);

  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;
  vColor = instanceColors;
  
  // picking_setPickingColor(instancePickingColors);

  // geometry.worldPosition = instancePositions;
}
`;