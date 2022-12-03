import { BaseSprite } from './baseSprite'
import { TRAIN_CRASHED } from '../messages'
import { MiscUtils, getRandom16 } from '../utils'
import { SPRITE_TRAIN } from './spriteConstants'
import { SpriteUtils } from './spriteUtils'
import * as TileValues from '../tiles/tileValues'

function TrainSprite(map, spriteManager, x, y) {
  this.init(SPRITE_TRAIN, map, spriteManager, x, y)
  this.width = 32
  this.height = 32
  this.xOffset = -16
  this.yOffset = -16
  this.frame = 1
  this.dir = 4
}

BaseSprite(TrainSprite)

const tileDeltaX = [0, 16, 0, -16]
const tileDeltaY = [-16, 0, 16, 0]
const xDelta = [0, 4, 0, -4, 0]
const yDelta = [-4, 0, 4, 0, 0]

const TrainPic2 = [1, 2, 1, 2, 5]

// Frame values
const NORTHSOUTH = 1
const EASTWEST = 2
const NWSE = 3
const NESW = 4
const UNDERWATER = 5

// Direction values
const NORTH = 0
const EAST = 1
const SOUTH = 2
const WEST = 3
const CANTMOVE = 4

TrainSprite.prototype.move = function (
  spriteCycle,
  disasterManager,
  blockMaps
) {
  // Trains can only move in the 4 cardinal directions
  // Over the course of 4 frames, we move through a tile, so
  // ever fourth frame, we try to find a direction to move in
  // (excluding the opposite direction from the current direction
  // of travel). If there is no possible direction found, our direction
  // is set to CANTMOVE. (Thus, if we're in a dead end, we can start heading
  // backwards next time round). If we fail to find a destination after 2 attempts,
  // we die.

  if (this.frame === NWSE || this.frame === NESW) { this.frame = TrainPic2[this.dir] }

  this.x += xDelta[this.dir]
  this.y += yDelta[this.dir]

  // Find a new direction.
  if ((spriteCycle & 3) === 0) {
    // Choose a random starting point for our search
    const dir = getRandom16() & 3

    for (let i = dir; i < dir + 4; i++) {
      const dir2 = i & 3

      if (this.dir !== CANTMOVE) {
        // Avoid the opposite direction
        if (dir2 === ((this.dir + 2) & 3)) continue
      }

      const tileValue = SpriteUtils.getTileValue(
        this.map,
        this.x + tileDeltaX[dir2],
        this.y + tileDeltaY[dir2]
      )

      if (
        (tileValue >= TileValues.RAILBASE
          && tileValue <= TileValues.LASTRAIL)
        || tileValue === TileValues.RAILVPOWERH
        || tileValue === TileValues.RAILHPOWERV
      ) {
        if (this.dir !== dir2 && this.dir !== CANTMOVE) {
          if (this.dir + dir2 === WEST) this.frame = NWSE
          else this.frame = NESW
        } else {
          this.frame = TrainPic2[dir2]
        }

        if (tileValue === TileValues.HRAIL || tileValue === TileValues.VRAIL) { this.frame = UNDERWATER }

        this.dir = dir2
        return
      }
    }

    // Nowhere to go. Die.
    if (this.dir === CANTMOVE) {
      this.frame = 0
      return
    }

    // We didn't find a direction this time. We'll try the opposite
    // next time around
    this.dir = CANTMOVE
  }
}

TrainSprite.prototype.explodeSprite = function () {
  this.frame = 0
  this.spriteManager.makeExplosionAt(this.x, this.y)
  this._emitEvent(TRAIN_CRASHED, {
    showable: true,
    x: this.worldX,
    y: this.worldY,
  })
}

// Metadata for image loading
Object.defineProperties(TrainSprite, {
  ID: MiscUtils.makeConstantDescriptor(1),
  width: MiscUtils.makeConstantDescriptor(32),
  frames: MiscUtils.makeConstantDescriptor(5),
})

export { TrainSprite }
