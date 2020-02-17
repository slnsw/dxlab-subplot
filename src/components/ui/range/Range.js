import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';
import { applyFilters } from '../../../context/MapsActions';
import { get } from 'lodash';

import Slider, { Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { getUpdatedHandles } from 'react-compound-slider/Slider/utils'
import { SliderRail, Handle, Track, Tick } from './components'
import { BarChart } from './BarChart'


// const sliderStyle = {
//     position: 'absolute',
//     marginLeft: '45%',
//     touchAction: 'none',
//     zIndex: '3001',
//     right: '80px',
//     top: '10%',
//     height: '80vh',
// }

const sliderStyle = {
    position: 'relative',
    height: '100%',
    // border: '1px solid red',
    width: 'auto',
    // overflow: 'hidden'
}

const barStyle = {
    // border:'1px solid red',  
    position: 'absolute',
    marginLeft: '5px',
    height: '100%',
    width: '100%',
    zIndex: '3003'
}

const containerStyle = {
    // border: '1px solid blue',
    position: 'absolute',
    top: '10%',
    height: '80vh',
    width: '5%',
    right: '2%',
    // touchAction: 'none',
    zIndex: '3001',
    // overflow: 'hidden'
}


export class Range extends Component {


    onChange(values) {
        const [fromYear, toYear] = values
        if (fromYear > 0 && toYear > 0) {
            const [, dispatch] = this.context;
            dispatch(applyFilters({ fromYear, toYear }))
        }
    }

    mode(curr, next, step, reversed, getValue) {

        let distance = 20
        let indexForMovingHandle = -1;
        let directionMove = 0; // 0=neutral 

        // Prevent crossing
        for (let i = 0; i < curr.length; i++) {
            const c = curr[i];
            const n = next[i];

            // make sure keys are in same order if not return curr
            if (!n || n.key !== c.key) {
                return curr;
            } else if (n.val !== c.val) {
                indexForMovingHandle = i;
                directionMove = (n.val - c.val > 0) ? 1 : -1;
            }
        }
        // nothing has changed (shouldn't happen but just in case).
        if (indexForMovingHandle === -1) {
            return curr;
        }

        for (let i = 0; i < next.length; i++) {
            const n0 = next[i];
            const n1 = next[i + 1];
            const increment = (step * directionMove);

            if (n1 && (Math.abs(n0.val - n1.val) > distance || n0.val === n1.val)) {
                if (i === indexForMovingHandle) {
                    const newStep = n1.val + increment;

                    if (getValue(newStep) === newStep) {

                        const clone = getUpdatedHandles(
                            next,
                            n1.key,
                            n1.val + increment,
                            reversed
                        );
                        const check = this.mode(next, clone, step, reversed, getValue);

                        if (check === next) {
                            return curr;
                        } else {
                            return check;
                        }
                    } else {
                        return curr;
                    }

                } else {
                    const newStep = n0.val + increment;
                    if (getValue(newStep) === newStep) {
                        const clone = getUpdatedHandles(
                            next,
                            n0.key,
                            n0.val + increment,
                            reversed
                        );
                        const check = this.mode(next, clone, step, reversed, getValue);

                        if (check === next) {
                            return curr;
                        } else {
                            return check;
                        }
                    } else {
                        return curr;
                    }
                }
            }

        }
        return next
    }

    years() {
        const [state,] = this.context;
        const data = get(state, 'maps.dataSet', []);

        if (!data) {
            return [];
        }
        return data.map((it) => {
            return it.properties.year;
        }).sort()

    }

    render() {

        const [state,] = this.context;
        const fromYear = get(state, 'maps.filters.fromYear', 0);
        const toYear = get(state, 'maps.filters.toYear', 0);
        const maxYear = get(state, 'maps.meta.maxYear', 0);
        const minYear = get(state, 'maps.meta.minYear', 0);


        const domain = [minYear, maxYear]
        const defaultValues = [fromYear, toYear]


        return (
            <React.Fragment>


                <div style={containerStyle}>

                    <div style={barStyle}>
                        <BarChart
                            data={this.years()}
                            highlight={defaultValues}
                            domain={domain}
                        />
                    </div>

                    <Slider
                        vertical
                        mode={this.mode.bind(this)}
                        step={2}
                        domain={domain}
                        values={defaultValues}
                        rootStyle={sliderStyle}
                        onChange={this.onChange.bind(this)}
                    >

                        <Rail>
                            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                        </Rail>

                        <Handles>
                            {({ handles, getHandleProps }) => (
                                <div className="slider-handles">
                                    {handles.map(handle => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            domain={domain}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Handles>

                        <Tracks left={false} right={false}>
                            {({ tracks, getTrackProps }) => (
                                <div className="slider-tracks">
                                    {tracks.map(({ id, source, target }) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Tracks>

                        <Ticks count={10}>
                            {({ ticks }) => (
                                <div className="slider-ticks">
                                    {ticks.map(tick => (
                                        <Tick key={tick.id} tick={tick} />
                                    ))}
                                </div>
                            )}
                        </Ticks>

                    </Slider>
                </div>

            </React.Fragment>
        )
    }

}

Range.contextType = MapDataContext;