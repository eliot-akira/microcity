var clamp = function (value, min, max) {
  if (value < min) return min
  if (value > max) return max

  return value
}

var makeConstantDescriptor = function (value) {
  return {
    configurable: false,
    enumerable: false,
    writeable: false,
    value: value,
  }
}

var normaliseDOMid = function (id) {
  return (id[0] !== '#' ? '#' : '') + id
}

var reflectEvent = function (message, value) {
  this._emitEvent(message, value)
}

var MiscUtils = {
  clamp: clamp,
  makeConstantDescriptor: makeConstantDescriptor,
  normaliseDOMid: normaliseDOMid,
  reflectEvent: reflectEvent,
}

export { MiscUtils }
