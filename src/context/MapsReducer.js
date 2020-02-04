export const ActionTypes = {
    MAPS_DATA_REQUEST: 'MAPS_DATA_REQUEST',
    MAPS_DATA_COMPLETE: 'MAPS_DATA_COMPLETE',
    MAPS_DATA_FAIL: 'MAPS_DATA_FAIL',

    MAPS_FILTER_REQUEST: 'MAPS_FILTER_REQUEST',
    MAPS_FILTER_COMPLETE: 'MAPS_FILTER_COMPLETE',
    MAPS_FILTER_FAIL: 'MAPS_FILTER_FAIL',

    MAPS_DETAIL_REQUEST: 'MAPS_DETAIL_REQUEST',
    MAPS_DETAIL_COMPLETE: 'MAPS_DETAIL_COMPLETE',
    MAPS_DETAIL_FAIL: 'MAPS_DETAIL_FAIL',    
    
}


export function mapsReducer(state, action) { 
    switch (action.type) {

        case ActionTypes.MAPS_DATA_COMPLETE: {
            return {
                ...state,
                filters: action.filters,
                dataSet: action.dataSet, // Unfiltered data
                data: action.data,
                meta: action.meta
            };
        }

        case ActionTypes.MAPS_FILTER_COMPLETE: {
            return {
                ...state,
                data: action.data,
                filters : {
                    ...state.filters,
                    ...action.filters
                }
            }
        }

        default: 
            return state
    }
}
