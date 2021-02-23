## Unreleased

### Fix

- **map_deck**: Add small global z-offset of 0.01, it should help alleviate the z-fight when rendering multiple maps
- **map_deck**: missing mapbox global viewState after initialize app
- **map_deck**: lock horizontal and vertical scroll
- **map_deck**: add missing S3 friendly redirect path injection
- **map_deck**: implement slider for showing related maps in the modal window
- Map opacity when giving focus to map
- loading multiple sprite maps
- lint errors
- Geolookups ignoring polygons completely contain in the lookup polygon
- **mosaic-layer**: prevent zFighting and restore blend gl parameters after the layer is rendered
- **range-ui**: Firefox crash error when checking if the event was touch
- Hide year labels after idle focus finish
- Incorrect rotation angle of sprite images
- Shadow casting and rendering
- **mosaic-layer**: Incorrect sprite rotation and UV coordinates calculation
- **mosaic-layer**: Correct space uv coordinates in relation to Image pixel coordinates and implemented image rotation
- Added missing test sheet map

### Refactor

- **map_deck**: improve track dragging logic in the timeline range component
- Improve detail view of the selected map
- WIP Load multiple sprites
- Simplify maps state structure move all fields one level up
- Rage map selector and make it horizontal
- Loading maps data
- **mosaic-layer**: Add property offsetZ as alternative to change elevation in the image bounds

### Feat

- **map_deck**: Add navigation control
- **map_deck**: implement deep linking
- **map_deck**: implemented IIIF zoomify format and added links to SLNSW collection
- **map_etl**: implement loader for ingest IIIF URLs, date creation, etc. from hidden metadata of SLNSW collection website
- **map_etl**: implement mongoloader for ingesting SLNSW titles and links for Klokan data
- Add component to display information about the user geo lookup and the number of available maps
- Implemented GeoIndex to allow search within a given point and radius
- Add Idle mode when the user is not interacting with the maps and massive code clean up
- **mosaic-layer**: Allow individual opacity per individual object in the mosaic
- **mosaic-layer**: Implement picking and opacity
- **mosaic-layer**: Add mosaic manger for loading multiple image mapping and images
- **mosaic-layer**: WIP Add logic for loading and applying mapping textures
- **mosaic-layer**: Add logic to create image bounds via WebGl instance rendering
- **mosaic-layer**: WIP solve how to split coordinates into multiple attributes

### Perf

- Improved lookup information refresh after a filter is applied
- **footprint-shadow**: Improve performance by using DeckGL light shadow projection instead of using geojson polygon generated on run-time
- Move ui state to separated context
- **map-layer**: WIP to improve memory use and image loading
