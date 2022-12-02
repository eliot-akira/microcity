const clamp = function (value, min, max) {
  if (value < min) return min
  if (value > max) return max

  return value
}

const makeConstantDescriptor = function (value) {
  return {
    configurable: false,
    enumerable: false,
    writeable: false,
    value,
  }
}

const normaliseDOMid = function (id) {
  return (id[0] !== '#' ? '#' : '') + id
}

const reflectEvent = function (message, value) {
  this._emitEvent(message, value)
}

const MiscUtils = {
  clamp,
  makeConstantDescriptor,
  normaliseDOMid,
  reflectEvent,
}

export { MiscUtils }
