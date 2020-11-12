export const ActionTypes = {
  SOCKET_CONNECT_SERVER_REQUEST: 'SOCKET_CONNECT_SERVER_REQUEST',
  SOCKET_CONNECT_SERVER_COMPLETE: 'SOCKET_CONNECT_SERVER_COMPLETE',
  SOCKET_CONNECT_SERVER_FAILURE: 'SOCKET_CONNECT_SERVER_FAILURE',

  SOCKET_EMIT: 'SOCKET_EMIT',
  SOCKET_RECEIVED: 'SOCKET_RECEIVED'

}

export function socketReducer (state, action) {
  switch (action.type) {
    case ActionTypes.SOCKET_CONNECT_SERVER_SUCCESS: {
      return {
        ...state,
        socket: action.socket
      }
    }

    case ActionTypes.SOCKET_EMIT: {
      return state
    }

    case ActionTypes.SOCKET_RECEIVED: {
      return {
        ...state,
        [action.subject]: action.data
      }
    }

    default:
      return state
  }
}