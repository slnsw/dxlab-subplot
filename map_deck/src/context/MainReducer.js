import { mapsReducer } from './MapsReducer'
import { statusReducer } from './StatusReducer'

export const reducer = (state, action) => {
  const { status, ...maps } = state
  return {
    status: statusReducer(status, action),
    ...mapsReducer(maps, action)
  }
}
