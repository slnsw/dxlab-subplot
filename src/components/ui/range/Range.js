import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';
import { getMaps } from '../../../context/MapsActions';
import { get } from 'lodash';


import Slider from 'rc-slider';
import styles from './Range.module.scss';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const RangeTooltips = createSliderWithTooltip(Slider.Range);

export class Range extends Component {

    countByYear() {
        const [state,] = this.context;
        const data = get(state, 'maps.data', []);

        if (!data) {
            return;
        }

        return data.reduce((result, it) => {
            const year = it.properties.year;
            if (year) {
                const count = get(result, year, 0);
                // Update result
                result[year] = count + 1;
            }
            return result;


        }, {});


    }

    render() {
        const [state, dispatch] = this.context;
        const grps = this.countByYear();
        const fromYear = get(state, 'maps.filter.fromYear', 0);
        const toYear = get(state, 'maps.filter.toYear', 0);

        return (
            <React.Fragment>
                <div className={styles.range}>
                    <h1>Select range {fromYear} - {toYear} </h1>
                </div>


                <RangeTooltips
                    className={styles.slider}
                    min={1880}
                    max={1950}
                    marks={grps}
                    steps={20}
                    defaultValue={[fromYear, toYear]}
                    tipFormatter={value => ` Year ${value} `}
                    tipProps={{
                        placement: 'left'
                    }}
                    pushable
                    vertical
                    onChange={([fromYear, toYear]) => {
                        dispatch(getMaps({ fromYear, toYear }));
                    }} />

            </React.Fragment>
        )
    }

}

Range.contextType = MapDataContext;