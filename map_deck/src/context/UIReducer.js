export const ActionTypes = {

  UI_MAP_SELECT: 'UI_MAP_SELECT',
  UI_MAP_SELECT_OPACITY: 'UI_MAP_SELECT_OPACITY',
  UI_MAP_UNSELECT: 'UI_MAP_UNSELECT',

  UI_MAP_FOCUS: 'UI_MAP_FOCUS',
  UI_MAP_UNFOCUS: 'UI_MAP_UNFOCUS',

  UI_MAP_IDLE_FOCUS: 'UI_MAP_IDLE_FOCUS',
  UI_MAPS_UPDATE_VIEW_STATE_COMPLETE: 'UI_MAPS_UPDATE_VIEW_STATE_COMPLETE'

}

export function UIReducer (state, action) {
  switch (action.type) {
    case ActionTypes.UI_MAP_SELECT: {
      return {
        ...state,
        selected: action.selected,
        selectedOpacity: parseFloat(process.env.REACT_APP_SELECT_MAP_INITIAL_OPACITY)
      }
    }

    case ActionTypes.UI_MAP_UNSELECT: {
      return {
        ...state,
        selected: {}
      }
    }

    case ActionTypes.UI_MAP_SELECT_OPACITY: {
      return {
        ...state,
        selectedOpacity: action.opacity
      }
    }

    case ActionTypes.UI_MAP_FOCUS: {
      return {
        ...state,
        focus: action.focus
      }
    }

    case ActionTypes.UI_MAP_UNFOCUS: {
      return {
        ...state,
        focus: null,
        isIdle: false
      }
    }

    case ActionTypes.UI_MAP_IDLE_FOCUS: {
      return {
        ...state,
        ...action
      }
    }

    case ActionTypes.UI_MAPS_UPDATE_VIEW_STATE_COMPLETE: {
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
