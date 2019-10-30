import { ActionTypes } from './MapsReducer';
import { fetchData } from '../share/services';

export function fetchMaps({around, from, to}) {
    // console.log
    return (dispatch, state) => {
        const { geometry, properties:{radius} } = around;
 
        // Get data
        // const data = [];
        fetchData({
            ...state,
            around: geometry, 
            aroundRadius: radius
        })
        .then((data) => {
            dispatch({
                type: ActionTypes.GET_MAPS_AROUND,
                data,
                around,
                aroundRadius: radius
            })
        })
        .catch(console.log);
    }
}


export function showDetailMap({}) {
    return (dispatch, state) => {
        
    }
}