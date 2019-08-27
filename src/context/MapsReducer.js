import { fetchData } from '../share/services';

export function mapsReducer(state, action) { 
    switch (action.type) {
        case 'GET_MAPS_DUMMY': {
            return { count: state.count + 1 }
        }

        case 'GET_MAPS_AROUND': {
            const { around } = action.state;
            const { geometry, properties:{radius} } = around;
 
            // Get data
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
