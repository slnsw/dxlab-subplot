// import { socketReducer } from './SocketReducer'
import { mapsReducer } from './MapsReducer'
import { statusReducer } from './StatusReducer'

export const reducer = (state, action) => {
  const { status, ...maps } = state
  return {
    status: statusReducer(status, action),
    // comm: socketReducer(comm, action),
    ...mapsReducer(maps, action)
  }
}
