import React from 'react';

export const MapDataContext = React.createContext();


export function useMaps() {
  const context = React.useContext(MapDataContext)
  if (!context) {
    throw new Error(`useMaps must be used within a MapDataContext`)
  }

  console.log(context);

  const [state, dispatch] = context;

  // Common state logic
  const getMapsData = () => dispatch({ type: 'GET_MAPS' })
  

  return {
    state,
    dispatch,
    getMapsData,
  }
}