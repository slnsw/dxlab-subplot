import React, { Component } from 'react';

import { get } from 'lodash';
import { MapDataContext } from '../../../context/MapsContext';

const rootStyle = {
    position: 'absolute',
    color: 'white',
    top: 20,
    right: '7%',
    zIndex: 3010,
}

const rangeHeaderStyle = {
    textAlign: 'right',
    marginBottom: 0
}

const infoStyle = {
    textAlign: 'right',
    marginTop: 0
}

export class Header extends Component {

    render() {
        const [state,] = this.context;
        const fromYear = get(state, 'maps.filters.fromYear', 0);
        const toYear = get(state, 'maps.filters.toYear', 0);


        const inFocus = get(state, 'maps.focus.properties', {})
        const { title, year } = inFocus


        return (
            <div style={rootStyle}>
                <h1 style={rangeHeaderStyle}> {fromYear} - {toYear} </h1>
                {title && <p style={infoStyle}>[{year}] {title}</p>}
            </div>
        )
    }

}

Header.contextType = MapDataContext;