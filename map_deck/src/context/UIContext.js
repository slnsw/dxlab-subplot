import React from 'react'
import { UIReducer as reducer } from './UIReducer'
import { thunkDispatch } from './utils'

export const UIContext = React.createContext()

const initialState = {
  // UX
  focus: {}, // Hover map
  selected: {}
}

export function UIProvider (props) {
  const [state, dispatch] = React.useReducer(reducer, { ...initialState, ...props })
  const value = React.useMemo(() => [state, thunkDispatch(dispatch, state)], [state])
  return <UIContext.Provider value={value} {...props} />
}
