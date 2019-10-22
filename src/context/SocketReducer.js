import socket from '../share/socket';

export function socketReducer(state, action) { 
    switch (action.type) {
        case 'SOCKET_CONNECT_SERVER': {
            return {
                ...state,
                socket: socket.connect()
            };
        }

        case 'SOCKET_EMIT': {
            const {data} = action.state;
            socket.emit({data});
            // Update state

            return {
                ...state,
                ...action.state
            };
        }

        case 'SOCKET_EMIT_SEARCH': {
            const {data} = action.state;
            socket.emit({event: 'dxmap_search', data});
            // Update state

            return {
                ...state,
                ...action.state
            };
        }

        case 'SOCKET_LISTEN': {
            const {callback} = action;
            socket.listen({callback});
            // Update state

            return {
                ...state,
            };
        }

        case 'SOCKET_LISTEN_SEARCH': {
            const {callback} = action;
            socket.listen({event: 'dxmap_search', callback});
            // Update state

            return {
                ...state,
            };
        }


        default: {
            throw new Error(`Unsupported action type: ${action.type}`);
        }
    }
}
