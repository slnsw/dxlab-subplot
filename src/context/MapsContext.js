import React from 'react';
import { reducer } from './MainReducer';
import { thunkDispatch } from './utils';


export const MapDataContext = React.createContext();

const initialState = {
    maps: {
        data: [],
        filter: {}
    },
    comm: {}
}

export function MapsProvider(props) {
    // const [maps, setMaps] = React.useState({from:1886})
    const [state, dispatch] = React.useReducer(reducer, {...initialState, ...props})
    const value = React.useMemo(() => [state, thunkDispatch(dispatch, state)], [state])
    return <MapDataContext.Provider value={value} {...props} />
}
