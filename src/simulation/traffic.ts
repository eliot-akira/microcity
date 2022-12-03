import { forEachCardinalDirection } from '../map/direction'
import { MiscUtils, getRandom } from '../utils'
import { Position } from '../map/position'
import { SPRITE_HELICOPTER } from '../sprites/spriteConstants'
import { SpriteUtils } from '../sprites/spriteUtils'
import { TileUtils } from '../tiles/tileUtils'
import { DIRT, POWERBASE, ROADBASE } from '../tiles/tileValues'

function Traffic(map, spriteManager) {
  this._map = map
  this._stack = []
  this._spriteManager = spriteManager
}

Traffic.prototype.makeTraffic = function (x, y, blockMaps, destFn) {
  this._stack = []

  const pos = new Position(x, y)
  if (this.findPerimeterRoad(pos)) {

    const drive = this.tryDrive(pos, destFn)

    // console.log('makeTraffic', [x, y], drive)

    if (drive) {
      this.addToTrafficDensityMap(blockMaps)
      return Traffic.ROUTE_FOUND
    }

    return Traffic.NO_ROUTE_FOUND
  } else {
    return Traffic.NO_ROAD_FOUND
  }
}

Traffic.prototype.addToTrafficDensityMap = function (blockMaps) {
  const trafficDensityMap = blockMaps.trafficDensityMap

  while (this._stack.length > 0) {

    const pos = this._stack.pop()

    if (!this._map.testBounds(pos.x, pos.y)) continue

    const tileValue = this._map.getTileValue(pos.x, pos.y)

    if (tileValue >= ROADBASE && tileValue < POWERBASE) {

      // Update traffic density.

      let traffic = trafficDensityMap.worldGet(pos.x, pos.y)
      traffic += 50
      traffic = Math.min(traffic, 240)
      trafficDensityMap.worldSet(pos.x, pos.y, traffic)

      // Attract traffic copter to the traffic
      if (traffic >= 240 && getRandom(5) === 0) {
        const sprite = this._spriteManager.getSprite(SPRITE_HELICOPTER)
        if (sprite !== null) {
          sprite.destX = SpriteUtils.worldToPix(pos.x)
          sprite.destY = SpriteUtils.worldToPix(pos.y)
        }
      }
    }
  }
}

const perimX = [-1, 0, 1, 2, 2, 2, 1, 0, -1, -2, -2, -2]
const perimY = [-2, -2, -2, -1, 0, 1, 2, 2, 2, 1, 0, -1]

Traffic.prototype.findPerimeterRoad = function (pos) {
  for (let i = 0; i < 12; i++) {
    const xx = pos.x + perimX[i]
    const yy = pos.y + perimY[i]

    if (this._map.testBounds(xx, yy)) {
      if (TileUtils.isDriveable(this._map.getTileValue(xx, yy))) {
        pos.x = xx
        pos.y = yy
        return true
      }
    }
  }

  return false
}

const MAX_TRAFFIC_DISTANCE = 30

Traffic.prototype.tryDrive = function (startPos, destFn) {
  let dirLast
  let drivePos = new Position(startPos.x, startPos.y)

  /* Maximum distance to try */
  for (let dist = 0; dist < MAX_TRAFFIC_DISTANCE; dist++) {
    const dir = this.tryGo(drivePos, dirLast)

    if (dir) {
      drivePos = Position.move(drivePos, dir)
      dirLast = dir.oppositeDirection()

      if (dist & 1) this._stack.push(new Position(drivePos.x, drivePos.y))

      if (this.driveDone(drivePos, destFn)) return true
    } else {
      if (this._stack.length > 0) {
        this._stack.pop()
        dist += 3
      } else {
        return false
      }
    }
  }

  return false
}

Traffic.prototype.tryGo = function (pos, dirLast) {
  const directions = []

  // Find connections from current position.
  let count = 0

  forEachCardinalDirection((dir) => {
    if (
      dir !== dirLast
      && TileUtils.isDriveable(
        this._map.getTileFromMapOrDefault(pos, dir, DIRT)
      )
    ) {
      directions.push(dir)
      count++
    }
  })
  if (count === 0) {
    return
  }

  if (count === 1) {
    return directions[0]
  }

  const index = getRandom(directions.length - 1)
  return directions[index]
}

Traffic.prototype.driveDone = function (pos, destFn) {
  if (pos.y > 0) {
    if (destFn(this._map.getTileValue(pos.x, pos.y - 1))) return true
  }

  if (pos.x < this._map.width - 1) {
    if (destFn(this._map.getTileValue(pos.x + 1, pos.y))) return true
  }

  if (pos.y < this._map.height - 1) {
    if (destFn(this._map.getTileValue(pos.x, pos.y + 1))) return true
  }

  if (pos.x > 0) {
    if (destFn(this._map.getTileValue(pos.x - 1, pos.y))) return true
  }

  return false
}

Object.defineProperties(Traffic, {
  ROUTE_FOUND: MiscUtils.makeConstantDescriptor(1),
  NO_ROUTE_FOUND: MiscUtils.makeConstantDescriptor(0),
  NO_ROAD_FOUND: MiscUtils.makeConstantDescriptor(-1),
})

export { Traffic }
