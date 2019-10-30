import { fetchData } from '../share/services';

export const ActionTypes = {
    GET_MAPS_AROUND: 'GET_MAPS_AROUND',
    SHOW_DETAIL_MAP: 'SHOW_DETAIL_MAP',
    HIGHLIGHT_MAP: 'HIGHLIGHT_MAP',
    
}


export function mapsReducer(state, action) { 
    switch (action.type) {
        case ActionTypes.HIGHLIGHT_MAP: {
            // Update state with given highlight map data
            return {
                ...state,
                ...action.state
            };
        }

        case ActionTypes.GET_MAPS_AROUND: {
            // Update state
            return {
                ...state,
                data: action.data,
                around: action.around,
                aroundRadius: action.aroundRadius
            };
        }

        case ActionTypes.SHOW_DETAIL_MAP:
            return {
                ...state,
            }

        default: 
            return state
    }
}
