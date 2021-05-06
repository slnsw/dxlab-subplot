export const thunkDispatch = (dispatch, state) => {
  const defaults = { usePromiseCatch: true }
  return (input, { usePromiseCatch } = defaults) => {
    if (typeof input === 'function') {
      const res = input(dispatch, state)
      if (res) {
        // is a promise and usePromiseCatch is true
        // This means we want to set the catch automatically
        if (typeof res.then === 'function' && usePromiseCatch) {
          res.catch(() => { })
        }
      }
      return res
    } else {
      return dispatch(input)
    }
  }
}

// Year manipulations
export const roundYearDown = (year) => {
  return parseInt(Math.floor(year / 10.0)) * 10
}

export const roundYearUp = (year) => {
  return parseInt(Math.ceil(year / 10.0)) * 10
}
