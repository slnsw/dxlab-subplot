import { socketReducer } from './SocketReducer'
import { mapsReducer } from './MapsReducer'
import { statusReducer } from './StatusReducer'

export const reducer = ({ status, comm, maps }, action) => {
  return {
    status: statusReducer(status, action),
    comm: socketReducer(comm, action),
    maps: mapsReducer(maps, action)
  }
}
