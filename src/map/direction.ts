import { getRandom } from '../utils'

export type DirectionFn = (direction: Direction) => void;

export interface Direction {
  oppositeDirection(): Direction;
  rotateClockwise(): Direction;
  rotateCounterClockwise(): Direction;
}

class DirectionValue implements Direction {

  constructor(private readonly name: string) {}

  oppositeDirection(): Direction {
    return this.transform(4)
  }

  rotateClockwise(): Direction {
    return this.transform(1)
  }

  rotateCounterClockwise(): Direction {
    return this.transform(allDirections.length - 1)
  }

  toString(): string {
    return this.name
  }

  private transform(delta: number): Direction {
    const ourIndex = directionIndex(this)
    const desired = ourIndex + delta
    return allDirections[desired % allDirections.length]
  }
}

export const NORTH = Object.freeze(new DirectionValue('NORTH'))
export const NORTHEAST = Object.freeze(new DirectionValue('NORTHEAST'))
export const EAST = Object.freeze(new DirectionValue('EAST'))
export const SOUTHEAST = Object.freeze(new DirectionValue('SOUTHEAST'))
export const SOUTH = Object.freeze(new DirectionValue('SOUTH'))
export const SOUTHWEST = Object.freeze(new DirectionValue('SOUTHWEST'))
export const WEST = Object.freeze(new DirectionValue('WEST'))
export const NORTHWEST = Object.freeze(new DirectionValue('NORTHWEST'))

const allDirections = [
  NORTH,
  NORTHEAST,
  EAST,
  SOUTHEAST,
  SOUTH,
  SOUTHWEST,
  WEST,
  NORTHWEST,
]

function directionIndex(direction: DirectionValue): number {
  return allDirections.indexOf(direction)
}

const cardinalDirections = [
  NORTH,
  EAST,
  SOUTH,
  WEST,
]

export function forEachCardinalDirection(callback: DirectionFn) {
  cardinalDirections.forEach((dir) => callback(dir))
}

export function getRandomCardinalDirection(): Direction {
  return getRandomDirectionFrom(cardinalDirections)
}

export function getRandomDirection(): Direction {
  return getRandomDirectionFrom(allDirections)
}

function getRandomDirectionFrom(directionArray: Direction[]): Direction {
  const maxIndex = directionArray.length - 1
  const index = getRandom(maxIndex)
  return directionArray[index]
}
