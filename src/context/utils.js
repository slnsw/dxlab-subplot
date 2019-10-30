export const thunkDispatch = (dispatch, state) => {
    return (input) => {
        if (typeof input === 'function') {
            input(dispatch, state);
        }else{
            dispatch(input);
        }
    }; 
}