import { ActionTypes } from './MapsReducer';
import { fetchData } from '../share/services';
import { pickBy, get, identity } from 'lodash';

export function fetchMaps({around, aroundRadius, fromYear, toYear, assetIds}) {

    return (dispatch, state) => {
        const { geometry, properties:{radius} } = around;

        console.log(geometry);
 
        // Get data
        // const data = [];
        const filter = pickBy({
            ...state.maps.filter,
            ...(around && {around: get(around, 'geometry', null)}),
            ...(aroundRadius && {aroundRadius}),
            ...(fromYear && {fromYear}),
            ...(toYear && {toYear}),
            ...(assetIds && {assetIds})
        }, identity);

        console.log(filter);

        fetchData(filter)
            .then((data) => {
                dispatch({
                    type: ActionTypes.GET_MAPS_AROUND,
                    maps: {
                        data,
                        filter
                    }
                })
            })
            .catch(console.log);
    }
}


export function showDetailMap({}) {
    return (dispatch, state) => {
        
    }
}