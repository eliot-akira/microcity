import { BaseTool } from './baseTool'
import { Random } from './random'
import { ANIMBIT, BULLBIT, BURNBIT, CONDBIT } from './tileFlags'
import { TileUtils } from './tileUtils'
import { DIRT, FOUNTAIN, WOODS2 } from './tileValues'

var makeTool = BaseTool.makeTool
var ParkTool = makeTool(function (map) {
  this.init(10, map, true)
})

ParkTool.prototype.doTool = function (x, y, blockMaps) {
  if (this._worldEffects.getTileValue(x, y) !== DIRT) {
    this.result = this.TOOLRESULT_NEEDS_BULLDOZE
    return
  }

  var value = Random.getRandom(4)
  var tileFlags = BURNBIT | BULLBIT
  var tileValue

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
