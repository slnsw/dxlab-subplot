import { socketReducer } from './SocketReducer';
import { mapsReducer } from './MapsReducer';


export const reducer = ({ comm, maps }, action) => {
    console.log(maps);
    return {
        comm: socketReducer(comm, action),
        maps: mapsReducer(maps, action),
    }
};
