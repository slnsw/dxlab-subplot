## Unreleased

### Refactor

- Rage map selector and make it horizontal
- Loading maps data
- **mosaic-layer**: Add property offsetZ as alternative to change elevation in the image bounds

### Fix

- Hide year labels after idle focus finish
- **mosaic-layer**: Incorrect rotation angle of sprite images
- **mosaic-layer**: Shadow casting and rendering
- **mosaic-layer**: Incorrect sprite rotation and UV coordinates calculation
- **mosaic-layer**: Correct space uv coordinates in relation to Image pixel coordinates and implemented image rotation
- Added missing test sheet map

### Feat

- Add Idle mode when the user is not interacting with the maps and massive code clean up
- **mosaic-layer**: Allow individual opacity per individual object in the mosaic
- **mosaic-layer**: Implement picking and opacity
- **mosaic-layer**: Add mosaic manger for loading multiple image mapping and images
- **mosaic-layer**: WIP Add logic for loading and applying mapping textures
- **mosaic-layer**: Add logic to create image bounds via Webgl intance rendering
- **mosaic-layer**: WIP solve how to split coordinates into multiple attributes

### Perf

- Move ui state to separated context
- **map-layer**: WIP to improve memory use and image loading
