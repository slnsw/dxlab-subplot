## Unreleased

### Fix

- **map_deck**: add idle timeout to about popup also move timeout values to .env file
- **map_deck**: clean up
- **map_deck**: remove move .env.example from repository
- **map_deck**: clean up  .env.example of unnecessary settings
- **map_packer**: fix webp alpha compression quality
- **map_deck**: remove debugging code
- **map_deck**: restore default texture GL filters to NEAREST
- **map_deck**: fix non square sprite
- **map_etl**: add a non power of two crop size 768 as experiment to increase more details in the sprites
- **map_packer**: improve webp quality of the alpha channel
- **map_deck**: Added separated sprite configurations for web and kiosk
- **map_deck**: use webp as source of the map sprite. Also implemented a PNG fallback
- **map_packer**: optimize png after webp are created
- **map_packer**: convert sprites to webp
- **map_deck**: about button in kiosk mode been activated when searching
- **map_deck**: add a loading when starting the app
- **map_deck**: move about button to bottom when app in kiosk mode
- **map_deck**: add footer links to about modal window
- **map_deck**: Implemented about popup
- **map_deck**: monitor html changes and block links when running in kiosk mode
- **map_deck**: block all external links when running in kiosk mode
- **map_deck**: WIP support for trimmed texture sprites
- **map_deck**: update dataset removing rejected maps
- **map_packer**: reformat sprite atlas format to allow trimmed version
- **map_packer**: create asset sprite only using valid assets
- **map_etl**: exclude from final JSON dump assets that don't have a year
- **map_deck**: WIP loading component
- **map_deck**: add public_url to landmark model paths
- **map_deck**: remove debug console message
- **map_deck**: add to react env variable to set default app mode at compilation time
- **map_deck**: avoid no maps when idle mode is active
- **map_deck**: maximum recursion when dragging the navigation control
- **map_deck**: add opacity control for selected map
- **map_deck**: set app mode from url matching expression
- **map_deck**: stack geocoder and keyboard
- **map_deck**: When selecting a map centering map in screen and hiding other maps. Improved performance by removing unnecessary interaction layer
- **map_deck**: Kiosk keyboard tweaks
- **map_deck**: remove invalid map for dataset
- **map_deck**: use iiif thumbnails from SLNSW collection website
- **map_deck**: fix sprite rotation
- **map_deck**: re-arrange more maps like it in the modal window
- **map_deck**: re-organize modal window moving controls and title to the bottom
- **map_deck**: search container capturing pointer mouse events
- **map_deck**: hide maps outside of the search radius
- **map_deck**: add DXlab and SLNSW logos
- **map_deck**: ignore DeckGl piking of maps not visible in the current time range
- **map_deck**: expand time range to max and min year of the geo search lookup
- **map_deck**: apply style to new geocoder
- **map_deck**: implemented new search lookup component with support for virtual keyboard
- **map_deck**: apply DXLab font settings
- **map_deck**: apply DXLab font settings
- **map_deck**: CSS interfering with touch events in the timeline when running in kiosk mode
- **map_deck**: Add small global z-offset of 0.01, it should help alleviate the z-fight when rendering multiple maps
- **map_deck**: missing mapbox global viewState after initialize app
- **map_deck**: lock horizontal and vertical scroll
- **map_deck**: add missing S3 friendly redirect path injection
- **map_deck**: implement slider for showing related maps in the modal window
- **map_deck**: Map opacity when giving focus to map
- **map_deck**: loading multiple sprite maps
- **map_deck**: lint errors
- **map_deck**: Geolookups ignoring polygons completely contain in the lookup polygon
- **mosaic-layer**: prevent zFighting and restore blend gl parameters after the layer is rendered
- **range-ui**: Firefox crash error when checking if the event was Touch
- **map_deck**: Hide year labels after idle focus finish
- **map_deck**: Incorrect rotation angle of sprite images
- **map_deck**: Shadow casting and rendering
- **mosaic-layer**: Incorrect sprite rotation and UV coordinates calculation
- **mosaic-layer**: Correct space uv coordinates in relation to Image pixel coordinates and implemented image rotation
- **map_deck**: Added missing test sheet map

### Perf

- **map_deck**: Apply performance and UI changes after testing in the kiosk
- **map_deck**: stop reprocessing the full dataSet in every redraw
- **map_deck**: remove moved unnecessary layers
- **map_deck**: select a random small time range when idle
- **map_deck**: reduce processing data in result search component
- **map_deck**: Improved lookup information refresh after a filter is applied
- **footprint-shadow**: Improve performance by using DeckGL light shadow projection instead of using geojson polygon generated on run-time
- Move ui state to separated context
- **map-layer**: WIP to improve memory use and image loading

### Refactor

- **map_deck**: added individual offset to avoid z-fighting and removed unnecessary layers
- **map_deck**: idle reset method overtime was filling the browser with multiple timeout without cancelling the previous one
- **map_deck**: move search result information close to the search button
- **map_deck**: improve track dragging logic in the timeline range component
- **map_deck**: Improve detail view of the selected map
- **map_deck**: WIP Load multiple sprites
- **map_deck**: Simplify maps state structure move all fields one level up
- **map_deck**: Rage map selector and make it horizontal
- **map_deck**: Loading maps data
- **mosaic-layer**: Add property offsetZ as alternative to change elevation in the image bounds

### Feat

- **map_deck**: add custom close key button to screen keyboard
- **map_etl**: add script to test all IIIF urls extracted from SLNSW collection page
- **map_deck**: Add navigation control
- **map_deck**: implement deep linking
- **map_deck**: implemented IIIF Zoomify format and added links to SLNSW collection
- **map_etl**: implement loader for ingest IIIF URLs, date creation, etc. from hidden metadata of SLNSW collection website
- **map_etl**: implement MongoLoader for ingesting SLNSW titles and links for Klokan data
- **map_deck**: Add component to display information about the user geo lookup and the number of available maps
- **map_deck**: Implemented GeoIndex to allow search within a given point and radius
- **map_deck**: Add Idle mode when the user is not interacting with the maps and massive code clean up
- **mosaic-layer**: Allow individual opacity per individual object in the mosaic
- **mosaic-layer**: Implement picking and opacity
- **mosaic-layer**: Add mosaic manger for loading multiple image mapping and images
- **mosaic-layer**: WIP Add logic for loading and applying mapping textures
- **mosaic-layer**: Add logic to create image bounds via WebGL instance rendering
- **mosaic-layer**: WIP solve how to split coordinates into multiple attributes
