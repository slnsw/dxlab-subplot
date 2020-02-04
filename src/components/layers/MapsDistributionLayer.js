
import { CompositeLayer } from 'deck.gl';
import { GeoJsonLayer } from '@deck.gl/layers';

import { get } from 'lodash';
import { MergeGeoJsonPolygon, interpolateScale } from '../../share/utils';


import { scaleLinear } from 'd3-scale';
import { color } from 'd3-color'


export class MapsDistributionLayer extends CompositeLayer {

    updateState({ props, changeFlags }) {
        if (changeFlags.dataChanged) {

            // Group data by year
            const { data, filters } = props;
            const { fromYear, toYear } = filters;

            if (!data) {
                return;
            }


            const groupData = data.reduce((result, { properties, geometry }) => {
                const elevation = interpolateScale(parseInt(properties.year), toYear, fromYear) * 10;
                let grp = get(result, properties.year, {});

                // Append maps to data. MANY NOT NECESSARY
                let maps = get(grp, 'maps', []);
                maps.push({ properties, geometry });
                grp['maps'] = maps;

                // Append map cutline to merged polygon data
                let merge = get(grp, 'merge', new MergeGeoJsonPolygon());
                grp['merge'] = merge;
                if (geometry) {
                    merge.append(geometry);
                }

                // Finally update the GeoJson feature structure
                let geoJson = merge.getPolygon();
                if (geoJson.type === 'Polygon') {
                    geoJson = {
                        type: 'feature',
                        geometry: geoJson,
                    }

                }

                grp['polygon'] = {
                    ...geoJson,
                    properties: {
                        'year': properties.year,
                        'count': maps.length,
                        'elevation': elevation
                    }
                };

                // Update result
                result[properties.year] = grp
                return result;

            }, {});

            const features = Object.keys(groupData).map((year) => {
                let item = groupData[year];
                return item.polygon;
            });

            const featureCollection = this.getSubLayerRow({
                'type': 'FeatureCollection',
                'features': features

            });


            this.setState({ featureCollection });
            this.setState({ groupData });


        }
    }



    buildLayers() {
        const { id, filters } = this.props;
        const { fromYear, toYear } = filters;
        const { featureCollection } = this.state;

        // const yearScale = scaleLinear().domain([this.state.year_from, this.state.year_to]).range(["brown", "steelblue"]); 
        const yearColorScale = scaleLinear([fromYear, toYear], ["gold", "limegreen"]);
        // const yearColorAlpha = scaleLinear([from, to], [255, 100]);


        if (featureCollection.features.length > 0) {

            // Build grouped year layers
            return new GeoJsonLayer({
                id: `${id}-years-footprint-layer`,
                data: featureCollection,
                extruded: false,
                stroked: true,
                pickable: true,
                autoHighlight: true,
                getLineWidth: 1,
                getFillColor: (d) => {
                    // const alpha = mapValue(d.year, this.state.year_from, this.state.year_to, 0, 255);
                    let c = color(yearColorScale(d.properties.year));
                    if (c) {
                        c = [c.r, c.g, c.b];
                    }
                    return c;
                },
                getElevation: (d) => d.properties.elevation,
                // onClick: (info) => {
                //         console.log(info);
                //         // this.setState({
                //         //     hoveredObject: {
                //         //         'year': get(info.object, 'year', '0')
                //         //     },
                //         //     pointerX: info.x,
                //         //     pointerY: info.y
                //         // })
                // }
            });

        }

    }

    // getPickingInfo({info, sourceLayer}) {
    //     console.log('compositive', info);
    // }

    renderLayers() {
        return this.buildLayers();
    }


}

MapsDistributionLayer.layerName = 'MapsDistributionLayer';

