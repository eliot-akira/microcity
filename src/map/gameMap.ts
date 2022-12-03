import { Bounds } from './bounds'
import * as Direction from './direction'
import { MiscUtils } from '../utils'
import { Position } from './position'
import { Tile } from '../tiles/tile'
import { BNCNBIT, ZONEBIT } from '../tiles/tileFlags'
import { TILE_INVALID } from '../tiles/tileValues'

function GameMap(width, height, defaultValue) {

  // if (!(this instanceof GameMap)) { return new GameMap(width, height, defaultValue) }

  if (
    arguments.length > 1
    && typeof width === 'number'
    && (width < 1 || height < 1)
  ) {
    throw new Error(
      'GameMap constructor called with invalid width or height '
        + width
        + ' '
        + height
    )
  }

  const defaultWidth = 120 // 240
  const defaultHeight = 100 // 240

  // Argument shuffling
  if (arguments.length === 0) {
    width = defaultWidth
    height = defaultHeight

    defaultValue = new Tile().getValue()
  } else if (arguments.length === 1) {
    if (typeof width === 'number') {
      // Default value
      defaultValue = width
    } else {
      // Tile
      defaultValue = width.getValue()
    }

    width = defaultWidth
    height = defaultHeight
  } else if (arguments.length === 2) {
    defaultValue = new Tile().getValue()
  } else if (arguments.length === 3) {
    if (typeof defaultValue === 'object') defaultValue = defaultValue.getValue()
  }

  this.width = width
  this.height = height
  this.bounds = Bounds.fromOrigin(width, height)

  const data = []
  for (let i = 0, l = width * height; i < l; i++) { data[i] = new Tile(defaultValue) }
  this._data = data

  // Generally set externally
  this.cityCentreX = Math.floor(this.width / 2)
  this.cityCentreY = Math.floor(this.height / 2)
  this.pollutionMaxX = this.cityCentreX
  this.pollutionMaxY = this.cityCentreY
}

const saveProps = [
  'cityCentreX',
  'cityCentreY',
  'pollutionMaxX',
  'pollutionMaxY',
  'width',
  'height',
]

GameMap.prototype.save = function (saveData) {
  for (let i = 0, l = saveProps.length; i < l; i++) {
    saveData[saveProps[i]] = this[saveProps[i]]
  }

  saveData.map = this._data.map(function (t) {
    return { value: t.getRawValue() }
  })
}

GameMap.prototype.load = function (saveData) {
  for (var i = 0, l = saveProps.length; i < l; i++) {
    this[saveProps[i]] = saveData[saveProps[i]] || this[saveProps[i]]
  }

  const map = saveData.map
  for (i = 0, l = map.length; i < l; i++) {
    this.setTileValue(
      i % this.width,
      Math.floor(i / this.width),
      map[i].value
    )
  }
}

GameMap.prototype._calculateIndex = function (x, y) {
  return x + y * this.width
}

GameMap.prototype.isPositionInBounds = function (pos) {
  return this.bounds.contains(pos)
}

GameMap.prototype.testBounds = function (x, y) {
  return this.isPositionInBounds(new Position(x, y))
}

GameMap.prototype.getTile = function (x, y, newTile) {
  // Argument-shuffling
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }

  const width = this.width
  const height = this.height

  if (x < 0 || y < 0 || x >= width || y >= height) {
    console.warn('getTile called with bad bounds', x, y)
    return new Tile(TILE_INVALID)
  }

  const tileIndex = x + y * width
  const tile = this._data[tileIndex]

  // Return the original tile if we're not given a tile to fill
  if (!newTile) return tile

  newTile.setFrom(tile)
  return tile
}

GameMap.prototype.getTileValue = function (x, y) {
  if (arguments.length < 1) {
    throw new Error(
      'GameMap getTileValue called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap getTileValue called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  if (!this._data[tileIndex]) return
  return this._data[tileIndex].getValue()
}

GameMap.prototype.getTileFlags = function (x, y) {
  if (arguments.length < 1) {
    throw new Error(
      'GameMap getTileFlags called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap getTileFlags called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  return this._data[tileIndex].getFlags()
}

GameMap.prototype.getTiles = function (x, y, w, h) {
  if (arguments.length < 3) {
    throw new Error(
      'GameMap getTiles called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 3) {
    h = w
    w = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap getTiles called with invalid bounds ' + x + ', ' + y
    )
  }

  const res = []
  for (let a = y, ylim = y + h; a < ylim; a++) {
    res[a - y] = []
    for (let b = x, xlim = x + w; b < xlim; b++) {
      const tileIndex = this._calculateIndex(b, a)
      res[a - y].push(this._data[tileIndex])
    }
  }
  return res
}

GameMap.prototype.getTileValuesForPainting = function (x, y, w, h, result) {
  result = result || []

  if (arguments.length < 3) {
    throw new Error(
      'GameMap getTileValuesForPainting called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 3) {
    h = w
    w = y
    y = x.y
    x = x.x
  }

  const width = this.width
  const height = this.height
  // Result is stored in row-major order
  for (let a = y, ylim = y + h; a < ylim; a++) {
    for (let b = x, xlim = x + w; b < xlim; b++) {
      if (a < 0 || b < 0 || a >= height || b >= width) {
        result[(a - y) * w + (b - x)] = TILE_INVALID
        continue
      }

      const tileIndex = b + a * width

      if (!this._data[tileIndex]) console.log(tileIndex, width, height, this._data)

      result[(a - y) * w + (b - x)] = this._data[tileIndex].getRawValue()
    }
  }

  return result
}

GameMap.prototype.getTileFromMapOrDefault = function (pos, dir, defaultTile) {
  switch (dir) {
    case Direction.NORTH:
      if (pos.y > 0) return this.getTileValue(pos.x, pos.y - 1)
      return defaultTile

    case Direction.EAST:
      if (pos.x < this.width - 1) return this.getTileValue(pos.x + 1, pos.y)

      return defaultTile

    case Direction.SOUTH:
      if (pos.y < this.height - 1) return this.getTileValue(pos.x, pos.y + 1)

      return defaultTile

    case Direction.WEST:
      if (pos.x > 0) return this.getTileValue(pos.x - 1, pos.y)

      return defaultTile

    default:
      return defaultTile
  }
}

GameMap.prototype.setTile = function (x, y, value, flags) {
  if (arguments.length < 3) {
    throw new Error(
      'GameMap setTile called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 3) {
    flags = value
    value = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap setTile called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  this._data[tileIndex].set(value, flags)
}

GameMap.prototype.setTo = function (x, y, tile) {
  if (arguments.length < 2) {
    throw new Error(
      'GameMap setTo called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (tile === undefined) {
    tile = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) { throw new Error('GameMap setTo called with invalid bounds ' + x + ', ' + y) }

  const tileIndex = this._calculateIndex(x, y)
  this._data[tileIndex] = tile
}

GameMap.prototype.setTileValue = function (x, y, value) {
  if (arguments.length < 2) {
    throw new Error(
      'GameMap setTileValue called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 2) {
    value = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    // throw new Error(
      console.log('GameMap setTileValue called with invalid bounds ' + x + ', ' + y)
    // )
    ReadableStreamDefaultController
  }

  const tileIndex = this._calculateIndex(x, y)
  if (!this._data[tileIndex]) return
  this._data[tileIndex].setValue(value)
}

GameMap.prototype.setTileFlags = function (x, y, flags) {
  if (arguments.length < 2) {
    throw new Error(
      'GameMap setTileFlags called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap setTileFlags called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  this._data[tileIndex].setFlags(flags)
}

GameMap.prototype.addTileFlags = function (x, y, flags) {
  if (arguments.length < 2) {
    throw new Error(
      'GameMap addTileFlags called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap addTileFlags called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  this._data[tileIndex].addFlags(flags)
}

GameMap.prototype.removeTileFlags = function (x, y, flags) {
  if (arguments.length < 2) {
    throw new Error(
      'GameMap removeTileFlags called with too few arguments'
        + [].toString.apply(arguments)
    )
  }

  // Argument-shuffling
  if (arguments.length === 2) {
    flags = y
    y = x.y
    x = x.x
  }

  if (!this.testBounds(x, y)) {
    throw new Error(
      'GameMap removeTileFlags called with invalid bounds ' + x + ', ' + y
    )
  }

  const tileIndex = this._calculateIndex(x, y)
  this._data[tileIndex].removeFlags(flags)
}

GameMap.prototype.putZone = function (centreX, centreY, centreTile, size) {
  let x, y

  if (
    !this.testBounds(centreX, centreY)
    || !this.testBounds(centreX - 1 + size - 1, centreY - 1 + size - 1)
  ) {
    throw new Error(
      'GameMap putZone called with invalid bounds ' + x + ', ' + y
    )
  }

  let tile = centreTile - 1 - size
  const startX = centreX - 1
  const startY = centreY - 1

  for (y = startY; y < startY + size; y++) {
    for (x = startX; x < startX + size; x++) {
      if (x === centreX && y === centreY) { this.setTo(x, y, new Tile(tile, BNCNBIT | ZONEBIT)) } else this.setTo(x, y, new Tile(tile, BNCNBIT))
      tile += 1
    }
  }
}

export { GameMap }
