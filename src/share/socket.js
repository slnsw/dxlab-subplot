import openSocket from 'socket.io-client'

export class SocketComunication {
  connect ({ success }) {
    console.log('Init socket server connection...')
    this.socket = openSocket(`${process.env.REACT_APP_WEBSOCKET}/`)

    this.socket.on('dxmap', (data) => {
      this.socket.emit('dxmap_join', { msg: data })

      if (success) {
        success(data)
      }
    })

    return this.socket
  }

  emit ({ event = 'dxmap_msg', data }) {
    this.socket.emit(event, data)
  }

  listen ({ event = 'dxmap_msg', callback }) {
    this.socket.on(event, (data) => {
      callback(data)
    })
  }
}

export default new SocketComunication()
