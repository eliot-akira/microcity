import { BaseTool } from './baseTool'
import { Random } from '../random'
import { ANIMBIT, BULLBIT, BURNBIT, CONDBIT } from '../tiles/tileFlags'
import { TileUtils } from '../tiles/tileUtils'
import { DIRT, FOUNTAIN, WOODS2 } from '../tiles/tileValues'

const makeTool = BaseTool.makeTool
const ParkTool = makeTool(function (map) {
  this.init(10, map, true, true)
})

ParkTool.prototype.doTool = function (x, y, blockMaps) {

  this.doAutoBulldoze(x, y)

  if (this._worldEffects.getTileValue(x, y) !== DIRT) {
    this.result = this.TOOLRESULT_NEEDS_BULLDOZE
    return
  }

  const value = Random.getRandom(4)
  let tileFlags = BURNBIT | BULLBIT
  let tileValue

  if (value === 4) {
    tileValue = FOUNTAIN
    tileFlags |= ANIMBIT
  } else {
    tileValue = value + WOODS2
  }

  this._worldEffects.setTile(x, y, tileValue, tileFlags)
  this.addCost(10)
  this.result = this.TOOLRESULT_OK
}

export { ParkTool }
