import { fetchData } from '../share/services';

export function mapsReducer(state, action) { 
    switch (action.type) {
        case 'HIGHLIGHT_MAP': {
            // Update state with given highlight map data
            return {
                ...state,
                ...action.state
            };
        }

        case 'GET_MAPS_AROUND': {
            const { around } = action.state;
            const { geometry, properties:{radius} } = around;
 
            // Get data
            // const data = [];
            const data = fetchData({
                ...state,
                around: geometry, 
                aroundRadius: radius
            }) 

            // Update state
            return {
                ...state,
                ...action.state,
                data
            };
        }

        default: {
            throw new Error(`Unsupported action type: ${action.type}`);
        }
    }
}
