import { ActionTypes } from './MapsReducer';
import { fetchData } from '../share/services';
import { pickBy, get, identity } from 'lodash';

export function getMaps({around, fromYear, toYear, assetIds}) {

    return (dispatch, state) => {
        const radius = get(around, 'properties.radius', null);

        // Get data
        // const data = [];
        const filter = pickBy({
            ...state.maps.filter,
            ...(around && {around}),
            ...(radius && {aroundRadius: radius}),
            ...(fromYear && {fromYear}),
            ...(toYear && {toYear}),
            ...(assetIds && {assetIds})
        }, identity);

        fetchData(filter)
            .then((data) => {
                dispatch({
                    type: ActionTypes.GET_MAPS_AROUND,
                    data,
                    // data: [],
                    filter
                })
            })
            .catch(console.log);
    }
}


export function showDetailMap({}) {
    return (dispatch, state) => {
        
    }
}