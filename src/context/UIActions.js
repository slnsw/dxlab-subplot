import { ActionTypes } from './UIReducer'

export function selectMap (object) {
  return (dispatch, state) => {
    dispatch({
      type: ActionTypes.UI_MAP_SELECT,
      selected: object
    })
  }
}

export function unSelectMap () {
  return (dispatch, state) => {
    dispatch({
      type: ActionTypes.UI_MAP_UNSELECT
    })
  }
}

export function focusMap (object) {
  console.log('focus', object)
  return (dispatch, state) => {
    dispatch({
      type: ActionTypes.UI_MAP_FOCUS,
      focus: object
    })
  }
}

export function removeFocusMap () {
  return (dispatch, state) => {
    dispatch({
      type: ActionTypes.UI_MAP_UNFOCUS
    })
  }
}
