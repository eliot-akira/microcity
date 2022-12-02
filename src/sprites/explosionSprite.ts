import { BaseSprite } from './baseSprite'
import { EXPLOSION_REPORTED, SOUND_EXPLOSIONHIGH } from '../messages'
import { MiscUtils } from '../utils'
import { Random } from '../random'
import { SPRITE_EXPLOSION } from './spriteConstants'
import { SpriteUtils } from './spriteUtils'
import { TileUtils } from '../tiles/tileUtils'
import { DIRT } from '../tiles/tileValues'

function ExplosionSprite(map, spriteManager, x, y) {
  this.init(SPRITE_EXPLOSION, map, spriteManager, x, y)
  this.width = 48
  this.height = 48
  this.xOffset = -24
  this.yOffset = -24
  this.frame = 1
}

BaseSprite(ExplosionSprite)

ExplosionSprite.prototype.startFire = function (x, y) {
  x = this.worldX
  y = this.worldY

  if (!this.map.testBounds(x, y)) return

  var tile = this.map.getTile(x, y)
  var tileValue = tile.getValue()

  if (!tile.isCombustible() && tileValue !== DIRT) return

  if (tile.isZone()) return

  this.map.setTo(x, y, TileUtils.randomFire())
}

ExplosionSprite.prototype.move = function (
  spriteCycle,
  disasterManager,
  blockMaps
) {
  if ((spriteCycle & 1) === 0) {
    if (this.frame === 1) {
      // Convert sprite coordinates to tile coordinates.
      var explosionX = this.worldX
      var explosionY = this.worldY
      this._emitEvent(SOUND_EXPLOSIONHIGH)
      this._emitEvent(EXPLOSION_REPORTED, { x: explosionX, y: explosionY })
    }

    this.frame++
  }

  if (this.frame > 6) {
    this.frame = 0

    this.startFire(this.x, this.y)
    this.startFire(this.x - 16, this.y - 16)
    this.startFire(this.x + 16, this.y + 16)
    this.startFire(this.x - 16, this.y + 16)
    this.startFire(this.x + 16, this.y + 16)
  }
}

// Metadata for image loading
Object.defineProperties(ExplosionSprite, {
  ID: MiscUtils.makeConstantDescriptor(7),
  width: MiscUtils.makeConstantDescriptor(48),
  frames: MiscUtils.makeConstantDescriptor(6),
})

export { ExplosionSprite }
