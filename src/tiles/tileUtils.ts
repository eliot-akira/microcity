import { Random } from '../random'
import { Tile } from './tile'
import { ANIMBIT, BULLBIT } from './tileFlags'
import * as TileValues from './tileValues'

const unwrapTile = function (f) {
  return function (tile) {
    if (tile instanceof Tile) tile = tile.getValue()
    return f.call(null, tile)
  }
}

const canBulldoze = unwrapTile(function (tileValue) {
  return (
    (tileValue >= TileValues.FIRSTRIVEDGE
      && tileValue <= TileValues.LASTRUBBLE)
    || (tileValue >= TileValues.POWERBASE + 2
      && tileValue <= TileValues.POWERBASE + 12)
    || (tileValue >= TileValues.TINYEXP && tileValue <= TileValues.LASTTINYEXP + 2)
  )
})

const isCommercial = unwrapTile(function (tile) {
  return tile >= TileValues.COMBASE && tile < TileValues.INDBASE
})

const isCommercialZone = function (tile) {
  return tile.isZone() && isCommercial(tile)
}

const isDriveable = unwrapTile(function (tile) {
  return (
    (tile >= TileValues.ROADBASE && tile <= TileValues.LASTROAD)
    || (tile >= TileValues.RAILHPOWERV && tile <= TileValues.LASTRAIL)
  )
})

const isFire = unwrapTile(function (tile) {
  return tile >= TileValues.FIREBASE && tile < TileValues.ROADBASE
})

const isFlood = unwrapTile(function (tile) {
  return tile >= TileValues.FLOOD && tile < TileValues.LASTFLOOD
})

const isIndustrial = unwrapTile(function (tile) {
  return tile >= TileValues.INDBASE && tile < TileValues.PORTBASE
})

const isIndustrialZone = function (tile) {
  return tile.isZone() && isIndustrial(tile)
}

const isManualExplosion = unwrapTile(function (tile) {
  return tile >= TileValues.TINYEXP && tile <= TileValues.LASTTINYEXP
})

const isRail = unwrapTile(function (tile) {
  return tile >= TileValues.RAILBASE && tile < TileValues.RESBASE
})

const isResidential = unwrapTile(function (tile) {
  return tile >= TileValues.RESBASE && tile < TileValues.HOSPITALBASE
})

const isResidentialZone = function (tile) {
  return tile.isZone() && isResidential(tile)
}

const isRoad = unwrapTile(function (tile) {
  return tile >= TileValues.ROADBASE && tile < TileValues.POWERBASE
})

const normalizeRoad = unwrapTile(function (tile) {
  return tile >= TileValues.ROADBASE && tile <= TileValues.LASTROAD + 1
    ? (tile & 15) + 64
    : tile
})

const randomFire = function () {
  return new Tile(TileValues.FIRE + (Random.getRandom16() & 3), ANIMBIT)
}

const randomRubble = function () {
  return new Tile(TileValues.RUBBLE + (Random.getRandom16() & 3), BULLBIT)
}

const TileUtils = {
  canBulldoze,
  isCommercial,
  isCommercialZone,
  isDriveable,
  isFire,
  isFlood,
  isIndustrial,
  isIndustrialZone,
  isManualExplosion,
  isRail,
  isResidential,
  isResidentialZone,
  isRoad,
  normalizeRoad,
  randomFire,
  randomRubble,
}

export { TileUtils }
