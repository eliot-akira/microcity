import { BaseTool } from './baseTool'
import { Connector } from './connector'

// Take a tool constructor, make it inherit from BaseTool, and add
// the various connection related functions
const makeTool = BaseTool.makeTool
const ConnectingTool = function (toolConstructor) {
  return Connector(makeTool(toolConstructor))
}

export { ConnectingTool }
