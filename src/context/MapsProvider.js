import React from 'react';

import {MapDataContext} from './MapsContext';
import {mapsReducer} from './MapsReducer';


export function MapsProvider(props) {
    // const [maps, setMaps] = React.useState({from:1886})
    const [state, dispatch] = React.useReducer(mapsReducer, props)
    const value = React.useMemo(() => [state, dispatch], [state])
    return <MapDataContext.Provider value={value} {...props} />
}
