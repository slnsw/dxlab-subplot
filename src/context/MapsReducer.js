export const ActionTypes = {
  MAPS_DATA_REQUEST: 'MAPS_DATA_REQUEST',
  MAPS_DATA_COMPLETE: 'MAPS_DATA_COMPLETE',
  MAPS_DATA_FAIL: 'MAPS_DATA_FAIL',

  MAPS_FILTER_REQUEST: 'MAPS_FILTER_REQUEST',
  MAPS_FILTER_COMPLETE: 'MAPS_FILTER_COMPLETE',
  MAPS_FILTER_FAIL: 'MAPS_FILTER_FAIL',

  MAPS_GEO_LOOKUP_REQUEST: 'MAPS_GEO_LOOKUP_REQUEST',
  MAPS_GEO_LOOKUP_COMPLETE: 'MAPS_GEO_LOOKUP_COMPLETE',
  MAPS_GEO_LOOKUP_FAIL: 'MAPS_GEO_LOOKUP_FAIL',
  MAPS_GEO_LOOKUP_CLEAN_COMPLETE: 'MAPS_GEO_LOOKUP_CLEAN_COMPLETE',

  MAPS_UPDATE_VIEW_STATE_COMPLETE: 'MAPS_UPDATE_VIEW_STATE_COMPLETE'
}

export function mapsReducer (state, action) {
  switch (action.type) {
    case ActionTypes.MAPS_DATA_COMPLETE: {
      const { filters, dataSet, fullGeoIndex, data, geoIndex, meta } = action
      return {
        ...state,
        filters,
        dataSet, // Unfiltered data
        fullGeoIndex,
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

    case ActionTypes.MAPS_GEO_LOOKUP_REQUEST: {
      return {
        ...state,
        near: {}
      }
    }

    case ActionTypes.MAPS_GEO_LOOKUP_COMPLETE: {
      return {
        ...state,
        near: action.near
      }
    }

    case ActionTypes.MAPS_GEO_LOOKUP_FAIL: {
      return {
        ...state,
        near: {}
      }
    }

    case ActionTypes.MAPS_GEO_LOOKUP_CLEAN_COMPLETE: {
      return {
        ...state,
        near: {}
      }
    }

    case ActionTypes.MAPS_UPDATE_VIEW_STATE_COMPLETE: {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          ...action.viewState
        }
      }
    }

    default:
      return state
  }
}
