export const ActionTypes = {
  MAPS_DATA_REQUEST: 'MAPS_DATA_REQUEST',
  MAPS_DATA_COMPLETE: 'MAPS_DATA_COMPLETE',
  MAPS_DATA_FAIL: 'MAPS_DATA_FAIL',

  MAPS_FILTER_REQUEST: 'MAPS_FILTER_REQUEST',
  MAPS_FILTER_COMPLETE: 'MAPS_FILTER_COMPLETE',
  MAPS_FILTER_FAIL: 'MAPS_FILTER_FAIL'
}

export function mapsReducer (state, action) {
  switch (action.type) {
    case ActionTypes.MAPS_DATA_COMPLETE: {
      const { filters, dataSet, dataSetGeoIndex, data, geoIndex, meta } = action
      return {
        ...state,
        filters,
        dataSet, // Unfiltered data
        dataSetGeoIndex,
        data,
        geoIndex,
        meta
      }
    }

    case ActionTypes.MAPS_FILTER_COMPLETE: {
      const { data, geoIndex } = action
      return {
        ...state,
        data,
        geoIndex,
        filters: {
          ...state.filters,
          ...action.filters
        }
      }
    }

    default:
      return state
  }
}
