import { Config } from './config'

// Decorate the given object, by adding {add|remove}EventListener methods, and an internal '_emitEvent' method
const EventEmitter = function (obj) {
  const events = {}

  const addListener = function (event, listener) {
    if (!(event in events)) events[event] = []

    const listeners = events[event]
    if (listeners.indexOf(listener) === -1) listeners.push(listener)
  }

  const removeListener = function (event, listener) {
    if (!(event in events)) events[event] = []

    const listeners = events[event]
    const index = listeners.indexOf(listener)
    if (index !== -1) listeners.splice(index, 1)
  }

  const emitEvent = function (event, value) {
    if (event === undefined) {
      if (!Config.debug) console.warn('Sending undefined event!')
      else throw new Error('Sending undefined event!')
    }

    if (!(event in events)) events[event] = []

    const listeners = events[event]
    for (let i = 0, l = listeners.length; i < l; i++) listeners[i](value)
  }

  const addProps = function (obj, message) {
    const hasExistingProp = [
      'addEventListener',
      'removeEventListener',
      '_emitEvent',
    ].some(function (prop) {
      return obj[prop] !== undefined
    })

    if (hasExistingProp) {
      throw new Error(
        'Cannot decorate '
          + message
          + ': existing properties would be overwritten!'
      )
    }

    obj.addEventListener = addListener
    obj.removeEventListener = removeListener
    obj._emitEvent = emitEvent
  }

  if (typeof obj === 'object') addProps(obj, 'object')
  else addProps(obj.prototype, 'constructor')

  return obj
}

export { EventEmitter }
