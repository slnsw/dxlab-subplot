export const thunkDispatch = (dispatch, state) => {
    return (input) => {
        if (typeof input === 'function') {
            input(dispatch, state);
        }else{
            dispatch(input);
        }
    }; 
}

// TODO: move this out this file
// Year maninulations
export const roundYearDown = (year) => {
    return parseInt(Math.floor(year / 10.0)) * 10;
}

export const roundYearUp = (year) => {
    return parseInt(Math.ceil(year / 10.0)) * 10;
}
