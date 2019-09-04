
import { CompositeLayer } from 'deck.gl';
import { PolygonLayer, GeoJsonLayer } from '@deck.gl/layers';

import { chain, pick, get, set, zipObject, cloneDeep } from 'lodash';
import { MergeGeoJsonPolygon, interpolateScale } from '../../share/utils';


import { scaleLinear } from 'd3-scale';
import { color } from 'd3-color'


export class MapsDistributionLayer extends CompositeLayer {


    groupLayerByYear(data) {
        const { mapContext: [mapState] } = this.props;
        const {years: {from, to}} = mapState;

        const grouped = chain(data)
            .groupBy("year")
            .toPairs()
            .map((current) => {
                return zipObject(["year", "maps"], current);
            })
            .value();


        return grouped.map((m, inx) => {
            const merge = new MergeGeoJsonPolygon();
            const yearElevationScale = interpolateScale(parseInt(m.year), to, from) * 10;  // 50 *  inx;

            //console.log(inx, yearElevationScale, yearScale(m.year), yearScale(inx));

            merge.setData(m.maps.map((i) => {
                return cloneDeep(i.cutline); 
            }));

            const polygon = merge.getPolygon();
            polygon['properties'] = {
                'year': m.year,
                'elevation': yearElevationScale
            };

            // const mergePolygon = merge.getCoordinates().map((coords) => {
            //     return [coords[0].map((coord) => {
            //         if (coord.push && yearElevationScale) { // :P hack fix me
            //             coord.push(yearElevationScale);
            //         }

            //         return coord;
            //     })];
            // });


            // console.log(m.year, polygon);



            // console.log(elv, polygon.geometry.coordinates);

            return {
                'year': m.year,
                'polygon': polygon
            };
        });

    }

    buildLayers(data) {
        const { mapContext: [mapState] } = this.props;
        const {years: {from, to}} = mapState;

        // const yearScale = scaleLinear().domain([this.state.year_from, this.state.year_to]).range(["brown", "steelblue"]); 
        const yearColorScale = scaleLinear([from, to], ["gold", "limegreen"]);
        const yearColorAlpha = scaleLinear([from, to], [255, 100]);
        
        // Group data by year
        const groupedData = this.groupLayerByYear(data);

        const layers = groupedData.map((m) => {

            if( m.polygon.geometry) {
                return new PolygonLayer({
                    id: 'footprint-' + m.year + '-layer',
                    data: m.polygon.geometry.coordinates,
                    pickable: true,
                    filled: true,
                    // autoHighlight: true,
                    opacity: 1,
                    visible: 1,
                    extruded: false,
                    // getPolygon: (d: any) =>  { console.log(d.polygon.geometry.coordinates); return d.polygon.geometry.coordinates},
                    getPolygon: (d) => d,
                    getElevation: (d) => m.polygon.properties.elevation,
                    getFillColor: (d) => {
                        let c = color(yearColorScale(m.year));
                        if (c) {
                            c = [c.r, c.g, c.b, yearColorAlpha(m.year)];
                        }
                        return c;
                    },
                    onHover: (info) => {
                        console.log(info);
                        this.setState({
                            hoveredObject: {
                                'year': get(info.object, 'year', '0')
                            },
                            pointerX: info.x,
                            pointerY: info.y
                        })
                    }
                });
            }
            
            return null; 
            
        });

        return layers;

    }


    renderLayers() {
        const { data } = this.props;
        return this.buildLayers(data);
    }


}

MapsDistributionLayer.layerName = 'MapsDistributionLayer';

