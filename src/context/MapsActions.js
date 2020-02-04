import { ActionTypes } from './MapsReducer';
import { fetchData,loadData } from '../share/services';
import { pickBy, get, identity, some, omit, map, isNumber, max, min } from 'lodash';



export function getMaps({...query}){
    return (dispatch, state) => {
        const {around} = query
        const radius = get(around, 'properties.radius', null);

        const filters = updatefilters(state.maps.filters, { radius, ...query})

        loadData()
            .then((data) => {
                // Get maxium and minium year 
                const years = map(data, 'properties.year').filter(d => isNumber(d) || !isNaN(d))
  
                dispatch({
                    type: ActionTypes.MAPS_DATA_COMPLETE,
                    filters,
                    dataSet: data,
                    data: filterData(data, filters),
                    meta: {
                        maxYear: max(years),
                        minYear: min(years)
                    }
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

export function applyFilters({...query}) {
    return (dispatch, state) => {
        const {around} = query
        const radius = get(around, 'properties.radius', null);

        const filters = updatefilters(state.maps.filters, { radius, ...query})
        const data = filterData(state.maps.dataSet, filters)      

        dispatch({
            type: ActionTypes.MAPS_FILTER_COMPLETE,
            filters,
            data
        })
    }
}

function updatefilters(current, {around, radius, fromYear, toYear, assetIds, ...properties}) {
    return pickBy({
        ...current,
        ...(around && {around}),
        ...(radius && {aroundRadius: radius}),
        ...(fromYear && {fromYear}),
        ...(toYear && {toYear}),
        ...properties
    }, identity);
}

function filterData(data, {around, radius, fromYear, toYear, assetIds, ...properties}) {

    return data.filter((d) => {
            let select = true
            // Filter by range of years
            select = d.properties.year >= fromYear && d.properties.year <= toYear

            // Filter by exact match of other properties
            if (select) {
                select = some([d.properties], omit(properties, ['aroundRadius']))
            }
            return select
        })
}

// Temporal method until full transition to API-less implementation
export function getMapsRaw({around, fromYear, toYear, assetIds}) {

    return (dispatch, state) => {
        const radius = get(around, 'properties.radius', null);

        // Get data
        // const data = [];
        const filters = pickBy({
            ...state.maps.filters,
            ...(around && {around}),
            ...(radius && {aroundRadius: radius}),
            ...(fromYear && {fromYear}),
            ...(toYear && {toYear}),
            ...(assetIds && {assetIds})
        }, identity);

        dispatch({
            type: ActionTypes.MAPS_DATA_REQUEST,
        });

        fetchData(filters)
            .then((data) => {
                dispatch({
                    type: ActionTypes.MAPS_DATA_COMPLETE,
                    data,
                    filters
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