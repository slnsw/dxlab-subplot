import React, { Component } from 'react';
import { MapDataContext } from '../../../context/MapsContext';
import { getMaps } from '../../../context/MapsActions';
import { get } from 'lodash';


import styles from './Range.module.scss';

export class Range extends Component {

    render() {
        const [state, dispatch] = this.context;
        const fromYear = get(state, 'maps.filter.fromYear', 0);
        const toYear = get(state, 'maps.filter.toYear', 0);
        return (
            <div className={styles.range}>
                <h1>Select range {fromYear} - {toYear} </h1>
                <button onClick={() => { console.log('change'); dispatch(getMaps({fromYear, toYear:1886})) }}>update</button>
            </div>
        )
    }
   
}

Range.contextType = MapDataContext;