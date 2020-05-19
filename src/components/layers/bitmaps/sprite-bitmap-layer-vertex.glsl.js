export default `
#define SHADER_NAME sprite-bitmap-layer-vertex-shader
attribute vec2 texCoords;
attribute vec3 positions;
attribute vec2 positions64xyLow;
attribute vec3 instancePickingColors;
varying vec2 vTexCoord;
varying vec3 vColor;
void main(void) {
  // geometry.worldPosition = positions;
  // geometry.uv = texCoords;
  gl_Position = project_position_to_clipspace(positions, positions64xyLow, vec3(0.0), geometry.position);
    // gl_Position = project_position_to_clipspace(positions, vec2(0.0), vec3(0.0), geometry.position);
  // DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  // vTexCoord = texCoords;
  vColor = positions;
  picking_setPickingColor(instancePickingColors);
}
`;