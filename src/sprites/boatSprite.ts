import { BaseSprite } from './baseSprite'
import { SHIP_CRASHED, SOUND_HONKHONK } from '../messages'
import { MiscUtils } from '../utils'
import { Random } from '../random'
import { SPRITE_SHIP, SpriteConstants } from './spriteConstants'
import { SpriteUtils } from './spriteUtils'
import * as TileValues from '../tiles/tileValues'

function BoatSprite(map, spriteManager, x, y) {
  this.init(SPRITE_SHIP, map, spriteManager, x, y)
  this.width = 48
  this.height = 48
  this.xOffset = -24
  this.yOffset = -24

  if (x < SpriteUtils.worldToPix(4)) this.frame = 3
  else if (x >= SpriteUtils.worldToPix(map.width - 4)) this.frame = 7
  else if (y < SpriteUtils.worldToPix(4)) this.frame = 5
  else if (y >= SpriteUtils.worldToPix(map.height - 4)) this.frame = 1
  else this.frame = 3

  this.newDir = this.frame
  this.dir = 10
  this.count = 1
}

BaseSprite(BoatSprite)

// This is an odd little function. It returns true if
// oldDir is 180° from newDir and tileValue is underwater
// rail or wire, and returns false otherwise
const oppositeAndUnderwater = function (tileValue, oldDir, newDir) {
  let opposite = oldDir + 4

  if (opposite > 8) opposite -= 8

  if (newDir !== opposite) return false

  if (
    tileValue === TileValues.POWERBASE
    || tileValue === TileValues.POWERBASE + 1
    || tileValue === TileValues.RAILBASE
    || tileValue === TileValues.RAILBASE + 1
  ) { return true }

  return false
}

const tileDeltaX = [0, 0, 1, 1, 1, 0, -1, -1, -1]
const tileDeltaY = [0, -1, -1, 0, 1, 1, 1, 0, -1]
const xDelta = [0, 0, 2, 2, 2, 0, -2, -2, -2]
const yDelta = [0, -2, -2, 0, 2, 2, 2, 0, -2]
const tileWhiteList = [
  TileValues.RIVER,
  TileValues.CHANNEL,
  TileValues.POWERBASE,
  TileValues.POWERBASE + 1,
  TileValues.RAILBASE,
  TileValues.RAILBASE + 1,
  TileValues.BRWH,
  TileValues.BRWV,
]

const CANTMOVE = 10

BoatSprite.prototype.move = function (spriteCycle, disasterManager, blockMaps) {
  let tile = TileValues.RIVER
  let frame, x, y

  if (this.soundCount > 0) this.soundCount--

  if (this.soundCount === 0) {
    if ((Random.getRandom16() & 3) === 1) {
      // TODO Scenarios
      // TODO Sound
      this._emitEvent(SOUND_HONKHONK)
    }

    this.soundCount = 200
  }

  if (this.count > 0) this.count--

  if (this.count === 0) {
    // Ships turn slowly: only 45° every 9 cycles
    this.count = 9

    // If already executing a turn, continue to do so
    if (this.frame !== this.newDir) {
      this.frame = SpriteUtils.turnTo(this.frame, this.newDir)
      return
    }

    // Otherwise pick a new direction
    // Choose a random starting direction to search from
    // 0 = N, 1 = NE, ... 7 = NW
    const startDir = Random.getRandom16() & 7
    let dir = startDir
    for (; dir < startDir + 8; dir++) {
      frame = (dir & 7) + 1

      if (frame === this.dir) continue

      x = this.worldX + tileDeltaX[frame]
      y = this.worldY + tileDeltaY[frame]

      if (this.map.testBounds(x, y)) {
        tile = this.map.getTileValue(x, y)

        // Test for a suitable water tile
        if (
          tile === TileValues.CHANNEL
          || tile === TileValues.BRWH
          || tile === TileValues.BRWV
          || oppositeAndUnderwater(tile, this.dir, frame)
        ) {
          this.newDir = frame
          this.frame = SpriteUtils.turnTo(this.frame, this.newDir)
          this.dir = frame + 4

          if (this.dir > 8) this.dir -= 8
          break
        }
      }
    }

    if (dir === startDir + 8) {
      this.dir = CANTMOVE
      this.newDir = (Random.getRandom16() & 7) + 1
    }
  } else {
    frame = this.frame

    if (frame === this.newDir) {
      this.x += xDelta[frame]
      this.y += yDelta[frame]
    }
  }

  if (this.spriteNotInBounds()) {
    this.frame = 0
    return
  }

  // If we didn't find a new direction, we might explode
  // depending on the last tile we looked at.
  for (let i = 0; i < 8; i++) {
    if (tile === tileWhiteList[i]) {
      break
    }

    if (i === 7) {
      this.explodeSprite()
      SpriteUtils.destroyMapTile(
        this.spriteManager,
        this.map,
        blockMaps,
        this.x,
        this.y
      )
    }
  }
}

BoatSprite.prototype.explodeSprite = function () {
  this.frame = 0
  this.spriteManager.makeExplosionAt(this.x, this.y)
  this._emitEvent(SHIP_CRASHED, {
    showable: true,
    x: this.worldX,
    y: this.worldY,
  })
}

// Metadata for image loading
Object.defineProperties(BoatSprite, {
  ID: MiscUtils.makeConstantDescriptor(4),
  width: MiscUtils.makeConstantDescriptor(48),
  frames: MiscUtils.makeConstantDescriptor(8),
})

export { BoatSprite }
