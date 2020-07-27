import { ActionTypes } from './SocketReducer'
import socket from '../share/socket'

export function socketConnect ({ listenCallback }) {
  // console.log
  return (dispatch, state) => {
    socket.connect({
      success: (data) => {
      // Set listen callback
        socket.listen({
          callback: (data) => {
            // Update socket storage with recived messages
            dispatch({
              type: ActionTypes.SOCKET_RECIVED,
              data
            })
            listenCallback(data)
          }
        })

        dispatch({
          type: ActionTypes.SOCKET_CONNECT_SERVER_SUCCESS,
          socket
        })
      }
    })
  }
}

export function socketEmit ({ subject, data }) {
  return (dispatch, state) => {
    const { comm: { socket } } = state
    if (socket) {
      socket.emit({ data: { subject, data } })
    } else {
      console.warn('Websockets not available')
    }
  }
}

export function socketisten ({ callback }) {
  // console.log
  return (dispatch, state) => {
    const { socket: { socket } } = state
    if (socket) {
      socket.listen({ callback })
    } else {
      console.warn('Websockets not available')
    }
  }
}
