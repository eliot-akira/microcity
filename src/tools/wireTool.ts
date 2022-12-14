import { ConnectingTool } from './connectingTool'
import { CONDBIT, BURNBIT, BULLBIT } from '../tiles/tileFlags'
import { TileUtils } from '../tiles/tileUtils'
import * as TileValues from '../tiles/tileValues'

const WireTool = ConnectingTool(function (map) {
  this.init(5, map, true, true)
})

WireTool.prototype.layWire = function (x, y) {
  this.doAutoBulldoze(x, y)
  let cost = this.toolCost

  let tile = this._worldEffects.getTileValue(x, y)
  tile = TileUtils.normalizeRoad(tile)

  switch (tile) {
    case TileValues.DIRT:
      this._worldEffects.setTile(
        x,
        y,
        TileValues.LHPOWER,
        CONDBIT | BURNBIT | BULLBIT
      )
      break

    case TileValues.RIVER:
    case TileValues.REDGE:
    case TileValues.CHANNEL:
      cost = 25

      if (x < this._map.width - 1) {
        tile = this._worldEffects.getTile(x + 1, y)
        if (tile.isConductive()) {
          tile = tile.getValue()
          tile = TileUtils.normalizeRoad(tile)
          if (
            tile != TileValues.HROADPOWER
            && tile != TileValues.RAILHPOWERV
            && tile != TileValues.HPOWER
          ) {
            this._worldEffects.setTile(
              x,
              y,
              TileValues.VPOWER,
              CONDBIT | BULLBIT
            )
            break
          }
        }
      }

      if (x > 0) {
        tile = this._worldEffects.getTile(x - 1, y)
        if (tile.isConductive()) {
          tile = tile.getValue()
          tile = TileUtils.normalizeRoad(tile)
          if (
            tile != TileValues.HROADPOWER
            && tile != TileValues.RAILHPOWERV
            && tile != TileValues.HPOWER
          ) {
            this._worldEffects.setTile(
              x,
              y,
              TileValues.VPOWER,
              CONDBIT | BULLBIT
            )
            break
          }
        }
      }

      if (y < this._map.height - 1) {
        tile = this._worldEffects.getTile(x, y + 1)
        if (tile.isConductive()) {
          tile = tile.getValue()
          tile = TileUtils.normalizeRoad(tile)
          if (
            tile != TileValues.VROADPOWER
            && tile != TileValues.RAILVPOWERH
            && tile != TileValues.VPOWER
          ) {
            this._worldEffects.setTile(
              x,
              y,
              TileValues.HPOWER,
              CONDBIT | BULLBIT
            )
            break
          }
        }
      }

      if (y > 0) {
        tile = this._worldEffects.getTile(x, y - 1)
        if (tile.isConductive()) {
          tile = tile.getValue()
          tile = TileUtils.normalizeRoad(tile)
          if (
            tile != TileValues.VROADPOWER
            && tile != TileValues.RAILVPOWERH
            && tile != TileValues.VPOWER
          ) {
            this._worldEffects.setTile(
              x,
              y,
              TileValues.HPOWER,
              CONDBIT | BULLBIT
            )
            break
          }
        }
      }

      return this.TOOLRESULT_FAILED

    case TileValues.ROADS:
      this._worldEffects.setTile(
        x,
        y,
        TileValues.HROADPOWER,
        CONDBIT | BURNBIT | BULLBIT
      )
      break

    case TileValues.ROADS2:
      this._worldEffects.setTile(
        x,
        y,
        TileValues.VROADPOWER,
        CONDBIT | BURNBIT | BULLBIT
      )
      break

    case TileValues.LHRAIL:
      this._worldEffects.setTile(
        x,
        y,
        TileValues.RAILHPOWERV,
        CONDBIT | BURNBIT | BULLBIT
      )
      break

    case TileValues.LVRAIL:
      this._worldEffects.setTile(
        x,
        y,
        TileValues.RAILVPOWERH,
        CONDBIT | BURNBIT | BULLBIT
      )
      break

    default:
      return this.TOOLRESULT_FAILED
  }

  this.addCost(cost)
  this.checkZoneConnections(x, y)
  return this.TOOLRESULT_OK
}

WireTool.prototype.doTool = function (x, y, blockMaps) {
  this.result = this.layWire(x, y)
}

export { WireTool }
