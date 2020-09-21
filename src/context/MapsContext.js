import React from 'react'
import { reducer } from './MainReducer'
import { thunkDispatch } from './utils'

export const MapDataContext = React.createContext()

const initialState = {
  data: [],
  dataSet: [],
  meta: {
    maxYear: 0,
    minYear: 0
  },
  filter: {},
  status: {}
}

export function MapsProvider (props) {
  const [state, dispatch] = React.useReducer(reducer, { ...initialState, ...props })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const thunk = React.useCallback(thunkDispatch(dispatch, state), [])
  const thunk = thunkDispatch(dispatch, state)
  const value = React.useMemo(() => [state, thunk], [state, thunk])
  return <MapDataContext.Provider value={value} {...props} />
}
