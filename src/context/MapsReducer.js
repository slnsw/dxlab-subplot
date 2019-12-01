export const ActionTypes = {
    MAPS_DATA_REQUEST: 'MAPS_DATA_REQUEST',
    MAPS_DATA_COMPLETE: 'MAPS_DATA_COMPLETE',
    MAPS_DATA_FAIL: 'MAPS_DATA_FAIL',

    MAPS_DETAIL_REQUEST: 'MAPS_DETAIL_REQUEST',
    MAPS_DETAIL_COMPLETE: 'MAPS_DETAIL_COMPLETE',
    MAPS_DETAIL_FAIL: 'MAPS_DETAIL_FAIL',    
    
}


export function mapsReducer(state, action) { 
    switch (action.type) {

        case ActionTypes.MAPS_DATA_COMPLETE: {
            return {
                ...state,
                data: action.data,
                filter: action.filter
            };
        }

        default: 
            return state
    }
}
