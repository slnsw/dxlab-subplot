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

    MAPS_SELECT: 'MAPS_SELECT',
    MAPS_UNSELECT: 'MAPS_UNSELECT',
    
    MAPS_FOCUS: 'MAPS_FOCUS',
    MAPS_UNFOCUS: 'MAPS_UNFOCUS',
    
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


        case ActionTypes.MAPS_SELECT: {
            return {
                ...state,
                selected: action.selected
            }
        }

        case ActionTypes.MAPS_UNSELECT: {
            return {
                ...state,
                selected: null
            }
        }


        case ActionTypes.MAPS_FOCUS: {
            return {
                ...state,
                focus: action.focus
            }
        }

        case ActionTypes.MAPS_UNFOCUS: {
            return {
                ...state,
                focus: null
            }
        }



        default: 
            return state
    }
}
