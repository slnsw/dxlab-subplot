/**
 * Automatically set an status flag per action.
 * @param {*} state
 * @param {*} action
 */
export function statusReducer (state = {}, action) {
  if (typeof action.type !== 'string') {
    return null
  }

  // The action format is: {NAME_ACTION}_{STATE}
  const bits = action.type.split('_')
  const name = bits.slice(0, -1).join('_')
  const status = bits[bits.length - 1]

  if (name && ['REQUEST', 'FAIL', 'COMPLETE'].includes(status)) {
    return {
      ...state,
      [name]: {
        pending: !!action.type.endsWith('_REQUEST'),
        ...(action.error && { error: action.error })
      }
    }
  }

  return {
    ...state
  }
}
