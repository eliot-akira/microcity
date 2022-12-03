import { EventEmitter } from '../eventEmitter'
import * as Messages from '../messages'
import { MiscUtils } from '../utils'
import { Random } from '../random'
import { SPRITE_AIRPLANE } from '../sprites/spriteConstants'
import { TileUtils } from '../tiles/tileUtils'
import * as TileValues from '../tiles/tileValues'
import { ZoneUtils } from '../zones/zoneUtils'

const DisasterManager = EventEmitter(function (map, spriteManager, gameLevel) {
  this._map = map
  this._spriteManager = spriteManager
  this._gameLevel = gameLevel

  this._floodCount = 0
  this.disastersEnabled = false
})

const DisChance = [479, 239, 59]

DisasterManager.prototype.doDisasters = function (census) {
  if (this._floodCount) this._floodCount--

  // TODO Scenarios

  if (!this.disastersEnabled) return

  if (!Random.getRandom(DisChance[this._gameLevel])) {
    switch (Random.getRandom(8)) {
      case 0:
      case 1:
        this.setFire()
        break

      case 2:
      case 3:
        this.makeFlood()
        break

      case 4:
        break

      case 5:
        this._spriteManager.makeTornado()
        break

      case 6:
        // TODO Earthquakes
        // this.makeEarthquake();
        break

      case 7:
      case 8:
        if (census.pollutionAverage > 60) this._spriteManager.makeMonster()
        break
    }
  }
}

DisasterManager.prototype.scenarioDisaster = function () {
  // TODO Scenarios
}

// User initiated meltdown: need to find the plant first
DisasterManager.prototype.makeMeltdown = function () {
  for (let x = 0; x < this._map.width - 1; x++) {
    for (let y = 0; y < this._map.height - 1; y++) {
      if (this._map.getTileValue(x, y) === TileValues.NUCLEAR) {
        this.doMeltdown(x, y)
        return
      }
    }
  }
}

const vulnerable = function (tile) {
  const tileValue = tile.getValue()

  if (
    tileValue < TileValues.RESBASE
    || tileValue > TileValues.LASTZONE
    || tile.isZone()
  ) { return false }

  return true
}

// User initiated earthquake
DisasterManager.prototype.makeEarthquake = function () {
  const strength = Random.getRandom(700) + 300
  this.doEarthquake(strength)

  this._emitEvent(Messages.EARTHQUAKE, {
    x: this._map.cityCenterX,
    y: this._map.cityCenterY,
  })

  for (let i = 0; i < strength; i++) {
    const x = Random.getRandom(this._map.width - 1)
    const y = Random.getRandom(this._map.height - 1)

    if (!this._map.testBounds(x, y)) continue

    if (vulnerable(this._map.getTile(x, y))) {
      if ((i & 0x3) !== 0) this._map.setTo(x, y, TileUtils.randomRubble())
      else this._map.setTo(x, y, TileUtils.randomFire())
    }
  }
}

DisasterManager.prototype.setFire = function (times, zonesOnly) {
  times = times || 1
  zonesOnly = zonesOnly || false

  for (let i = 0; i < times; i++) {
    const x = Random.getRandom(this._map.width - 1)
    const y = Random.getRandom(this._map.height - 1)

    if (!this._map.testBounds(x, y)) continue

    let tile = this._map.getTile(x, y)

    if (!tile.isZone()) {
      tile = tile.getValue()
      const lowerLimit = zonesOnly ? TileValues.LHTHR : TileValues.TREEBASE
      if (tile > lowerLimit && tile < TileValues.LASTZONE) {
        this._map.setTo(x, y, TileUtils.randomFire())
        this._emitEvent(Messages.FIRE_REPORTED, { showable: true, x, y })
        return
      }
    }
  }
}

// User initiated plane crash
DisasterManager.prototype.makeCrash = function () {
  let s = this._spriteManager.getSprite(SPRITE_AIRPLANE)
  if (s !== null) {
    s.explodeSprite()
    return
  }

  const x = Random.getRandom(this._map.width - 1)
  const y = Random.getRandom(this._map.height - 1)
  this._spriteManager.generatePlane(x, y)
  s = this._spriteManager.getSprite(SPRITE_AIRPLANE)
  s.explodeSprite()
}

// User initiated fire
DisasterManager.prototype.makeFire = function () {
  this.setFire(40, false)
}

const Dx = [0, 1, 0, -1]
const Dy = [-1, 0, 1, 0]

DisasterManager.prototype.makeFlood = function () {
  for (let i = 0; i < 300; i++) {
    const x = Random.getRandom(this._map.width - 1)
    const y = Random.getRandom(this._map.height - 1)
    if (!this._map.testBounds(x, y)) continue

    let tileValue = this._map.getTileValue(x, y)

    if (tileValue > TileValues.CHANNEL && tileValue <= TileValues.WATER_HIGH) {
      for (let j = 0; j < 4; j++) {
        const xx = x + Dx[j]
        const yy = y + Dy[j]

        if (!this._map.testBounds(xx, yy)) continue

        const tile = this._map.getTile(xx, yy)
        tileValue = tile.getValue()

        if (
          tile === TileValues.DIRT
          || (tile.isBulldozable() && tile.isCombustible)
        ) {
          this._map.setTile(xx, yy, TileValues.FLOOD, 0)
          this._floodCount = 30
          this._emitEvent(Messages.FLOODING_REPORTED, {
            showable: true,
            x: xx,
            y: yy,
          })
          return
        }
      }
    }
  }
}

DisasterManager.prototype.doFlood = function (x, y, blockMaps) {
  if (this._floodCount > 0) {
    // Flood is not over yet
    for (let i = 0; i < 4; i++) {
      if (Random.getChance(7)) {
        const xx = x + Dx[i]
        const yy = y + Dy[i]

        if (this._map.testBounds(xx, yy)) {
          const tile = this._map.getTile(xx, yy)
          const tileValue = tile.getValue()

          if (
            tile.isCombustible()
            || tileValue === TileValues.DIRT
            || (tileValue >= TileValues.WOODS5 && tileValue < TileValues.FLOOD)
          ) {
            if (tile.isZone()) ZoneUtils.fireZone(this._map, xx, yy, blockMaps)

            this._map.setTile(xx, yy, TileValues.FLOOD + Random.getRandom(2), 0)
          }
        }
      }
    }
  } else {
    if (Random.getChance(15)) this._map.setTile(x, y, TileValues.DIRT, 0)
  }
}

DisasterManager.prototype.doMeltdown = function (x, y) {
  this._spriteManager.makeExplosion(x - 1, y - 1)
  this._spriteManager.makeExplosion(x - 1, y + 2)
  this._spriteManager.makeExplosion(x + 2, y - 1)
  this._spriteManager.makeExplosion(x + 2, y + 2)

  let dY, dX

  // Whole power plant is on fire
  for (dX = x - 1; dX < x + 3; dX++) {
    for (dY = y - 1; dY < y + 3; dY++) {
      this._map.setTo(dX, dY, TileUtils.randomFire())
    }
  }

  // Add lots of radiation tiles around the plant
  for (let i = 0; i < 200; i++) {
    dX = x - 20 + Random.getRandom(40)
    dY = y - 15 + Random.getRandom(30)

    if (!this._map.testBounds(dX, dY)) continue

    const tile = this._map.getTile(dX, dY)

    if (tile.isZone()) continue

    if (tile.isCombustible() || tile.getValue() === TileValues.DIRT) { this._map.setTile(dX, dY, TileValues.RADTILE, 0) }
  }

  // Report disaster to the user
  this._emitEvent(Messages.NUCLEAR_MELTDOWN, { showable: true, x, y })
}

export { DisasterManager }
