export const ActionTypes = {

  UI_MAP_SELECT: 'UI_MAP_SELECT',
  UI_MAP_UNSELECT: 'UI_MAP_UNSELECT',

  UI_MAP_FOCUS: 'UI_MAP_FOCUS',
  UI_MAP_UNFOCUS: 'UI_MAP_UNFOCUS',

  UI_MAP_IDLE_FOCUS: 'UI_MAP_IDLE_FOCUS'

}

export function UIReducer (state, action) {
  switch (action.type) {
    case ActionTypes.UI_MAP_SELECT: {
      return {
        ...state,
        selected: action.selected
      }
    }

    case ActionTypes.UI_MAP_UNSELECT: {
      return {
        ...state,
        selected: {}
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

    default:
      return state
  }
}
