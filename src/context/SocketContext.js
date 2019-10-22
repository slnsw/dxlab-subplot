import React from 'react';

import {socketReducer} from './SocketReducer';

export const SocketContext = React.createContext();

export function SocketProvider(props) {
    const [state, dispatch] = React.useReducer(socketReducer, props);
    const value = React.useMemo(() => [state, dispatch], [state]);
    return <SocketContext.Provider value={value} {...props} />
}