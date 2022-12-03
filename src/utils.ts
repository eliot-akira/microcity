export const clamp = function (value, min, max) {
  if (value < min) return min
  if (value > max) return max

  return value
}

export const makeConstantDescriptor = function (value) {
  return {
    configurable: false,
    enumerable: false,
    writeable: false,
    value,
  }
}

export const normaliseDOMid = function (id) {
  return (id[0] !== '#' ? '#' : '') + id
}

export const reflectEvent = function (message, value) {
  this._emitEvent(message, value)
}


interface MathGlobal {
  random(): number;
  floor(n: number): number;
}

type UpperBoundedRNG = (maxValue: number) => number;

type SixteenBitRNG = () => number;

export function getChance(chance: number, rng: SixteenBitRNG = getRandom16): boolean {
  // tslint:disable-next-line:no-bitwise
  return (rng() & chance) === 0
}

export function getERandom(max: number, rng: UpperBoundedRNG = getRandom): number {
  const firstCandidate = rng(max)
  const secondCandidate = rng(max)
  return Math.min(firstCandidate, secondCandidate)
}

export function getRandom(max: number, mathGlobal: MathGlobal = Math): number {
  return mathGlobal.floor(mathGlobal.random() * (max + 1))
}

export function getRandom16(rng: UpperBoundedRNG = getRandom): number {
  return rng(65535)
}

export function getRandom16Signed(rng: SixteenBitRNG = getRandom16) {
  const value = rng()

  if (value < 32768) {
    return value
  } else {
    return -(2 ** 16) + value
  }
}

const MiscUtils = {
  clamp,
  makeConstantDescriptor,
  normaliseDOMid,
  reflectEvent,
}

export { MiscUtils }
