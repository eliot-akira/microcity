import { ConnectingTool } from './connectingTool'
import { EventEmitter } from '../eventEmitter'
import { SOUND_EXPLOSIONLOW, SOUND_EXPLOSIONHIGH } from '../messages'
import { Random } from '../random'
import { ANIMBIT, BULLBIT } from '../tiles/tileFlags'
import { TileUtils } from '../tiles/tileUtils'
import * as TileValues from '../tiles/tileValues'
import { ZoneUtils } from '../zoneUtils'

const BulldozerTool = EventEmitter(
  ConnectingTool(function (map) {
    this.init(10, map, true, true)
  })
)

BulldozerTool.prototype.putRubble = function (x, y, size) {
  for (let xx = x; xx < x + size; xx++) {
    for (let yy = y; yy < y + size; yy++) {
      if (this._map.testBounds(xx, yy)) {
        const tile = this._worldEffects.getTileValue(xx, yy)
        if (tile != TileValues.RADTILE && tile != TileValues.DIRT) {
          this._worldEffects.setTile(
            xx,
            yy,
            TileValues.TINYEXP + Random.getRandom(2),
            ANIMBIT | BULLBIT
          )
        }
      }
    }
  }
}

BulldozerTool.prototype.layDoze = function (x, y) {
  let tile = this._worldEffects.getTile(x, y)

  if (!tile.isBulldozable()) return this.TOOLRESULT_FAILED

  tile = tile.getValue()
  tile = TileUtils.normalizeRoad(tile)

  switch (tile) {
    case TileValues.HBRIDGE:
    case TileValues.VBRIDGE:
    case TileValues.BRWV:
    case TileValues.BRWH:
    case TileValues.HBRDG0:
    case TileValues.HBRDG1:
    case TileValues.HBRDG2:
    case TileValues.HBRDG3:
    case TileValues.VBRDG0:
    case TileValues.VBRDG1:
    case TileValues.VBRDG2:
    case TileValues.VBRDG3:
    case TileValues.HPOWER:
    case TileValues.VPOWER:
    case TileValues.HRAIL:
    case TileValues.VRAIL:
      this._worldEffects.setTile(x, y, TileValues.RIVER)
      break

    default:
      this._worldEffects.setTile(x, y, TileValues.DIRT)
      break
  }

  this.addCost(1)

  return this.TOOLRESULT_OK
}

BulldozerTool.prototype.doTool = function (x, y, blockMaps) {
  if (!this._map.testBounds(x, y)) this.result = this.TOOLRESULT_FAILED

  const tile = this._worldEffects.getTile(x, y)
  const tileValue = tile.getValue()

  let zoneSize = 0
  let deltaX
  let deltaY

  if (tile.isZone()) {
    zoneSize = ZoneUtils.checkZoneSize(tileValue)
    deltaX = 0
    deltaY = 0
  } else {
    const result = ZoneUtils.checkBigZone(tileValue)
    zoneSize = result.zoneSize
    deltaX = result.deltaX
    deltaY = result.deltaY
  }

  if (zoneSize > 0) {
    this.addCost(this.bulldozerCost)

    const dozeX = x
    const dozeY = y
    const centerX = x + deltaX
    const centerY = y + deltaY

    switch (zoneSize) {
      case 3:
        this._emitEvent(SOUND_EXPLOSIONHIGH)
        this.putRubble(centerX - 1, centerY - 1, 3)
        break

      case 4:
        this._emitEvent(SOUND_EXPLOSIONLOW)
        this.putRubble(centerX - 1, centerY - 1, 4)
        break

      case 6:
        this._emitEvent(SOUND_EXPLOSIONHIGH)
        this._emitEvent(SOUND_EXPLOSIONLOW)
        this.putRubble(centerX - 1, centerY - 1, 6)
        break
    }

    this.result = this.TOOLRESULT_OK
  } else {
    let toolResult
    if (
      tileValue === TileValues.RIVER
      || tileValue === TileValues.REDGE
      || tileValue === TileValues.CHANNEL
    ) {
      toolResult = this.layDoze(x, y)

      if (tileValue !== this._worldEffects.getTileValue(x, y)) this.addCost(5)
    } else {
      toolResult = this.layDoze(x, y)
      this.checkZoneConnections(x, y)
    }

    this.result = toolResult
  }
}

export { BulldozerTool }
