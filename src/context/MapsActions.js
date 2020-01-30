import { ActionTypes } from './MapsReducer';
import { fetchData,loadData } from '../share/services';
import { pickBy, get, identity } from 'lodash';



export function getMaps({around, fromYear, toYear, assetIds}){
    return (dispatch, state) => {
        const radius = get(around, 'properties.radius', null);

        const filter = pickBy({
            ...state.maps.filter,
            ...(around && {around}),
            ...(radius && {aroundRadius: radius}),
            ...(fromYear && {fromYear}),
            ...(toYear && {toYear}),
            ...(assetIds && {assetIds})
        }, identity);

        loadData()
            .then((data) => {
                dispatch({
                    type: ActionTypes.MAPS_DATA_COMPLETE,
                    data,
                    filter
                })
            })
            .catch((error) => {
                dispatch({
                    type: ActionTypes.MAPS_DATA_FAIL,
                    error
                })
            });
    }
}

export function applyFilter( fromYear, toYear) {

}

// Temporal method until full transition to API-less implementation
export function getMapsRaw({around, fromYear, toYear, assetIds}) {

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

        dispatch({
            type: ActionTypes.MAPS_DATA_REQUEST,
        });

        fetchData(filter)
            .then((data) => {
                dispatch({
                    type: ActionTypes.MAPS_DATA_COMPLETE,
                    data,
                    filter
                })
            })
            .catch((error) => {
                dispatch({
                    type: ActionTypes.MAPS_DATA_FAIL,
                    error
                })
            });
    }
}

export function showDetailMap({}) {
    return (dispatch, state) => {
        
    }
}