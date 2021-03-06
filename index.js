var stream = require('stream')
var util = require('util')

function WebsocketStream(server, protocol) {
  var self = this
  stream.Stream.call(this)
  this.readable = true
  this.writable = true
  if (typeof server === "object") {
    this.ws = server
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('error', this.onError.bind(this))
    this.ws.on('close', this.onClose.bind(this))
    this.ws.on('open', function() {
      self.emit('open')
    })
  } else {
    this.ws = new WebSocket(server, protocol)
    this.ws.onmessage = this.onMessage.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onclose = this.onClose.bind(this)
  }
}

util.inherits(WebsocketStream, stream.Stream)

module.exports = function(server, protocol) {
  return new WebsocketStream(server, protocol)
}

module.exports.WebsocketStream = WebsocketStream

WebsocketStream.prototype.onMessage = function(e, flags) {
  if (e.data) return this.emit('data', e.data, flags)
  this.emit('data', e, flags)
}

WebsocketStream.prototype.onError = function(err) {
  this.emit('error', err)
}

WebsocketStream.prototype.onClose = function(err) {
  this.emit('end')
}

WebsocketStream.prototype.write = function(data, options) {
  return this.ws.send(data, options)
}

WebsocketStream.prototype.end = function() {
  this.ws.close()
}
