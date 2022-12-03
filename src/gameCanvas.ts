import { AnimationManager } from './tiles/animationManager'
import { GameMap } from './map/gameMap'
import { MiscUtils } from './utils'
import { MouseBox } from './mouseBox'
import { Position } from './map/position'
import { TileSet } from './tiles/tileSet'
import { TILE_INVALID } from './tiles/tileValues'

class GameCanvas {

  static DEFAULT_ID = 'microcity-canvas'

  constructor(id, parentNode, zoomRatio = 1.4) {

    // if (!(this instanceof GameCanvas)) { return new GameCanvas(id, parentNode, width, height) }

    if (arguments.length < 1) {
      throw new Error('Attempt to construct a GameCanvas with no parameters')
    }

    // Argument shuffling
    if (parentNode === undefined) {
    // No ID supplied
      parentNode = id
      id = GameCanvas.DEFAULT_ID
    }

    if (typeof parentNode === 'string') {
      const orig = parentNode
      parentNode = $(MiscUtils.normaliseDOMid(parentNode))
      parentNode = parentNode.length === 0 ? null : parentNode[0]
      if (parentNode === null) throw new Error('Node ' + orig + ' not found')
    }

    this.zoomRatio = zoomRatio

    this._canvas = document.createElement('canvas')
    this._canvas.id = id
    this.ctx = this._canvas.getContext('2d')

    // The canvas is assumed to fill its container on-screen
    const rect = parentNode.getBoundingClientRect()

    this._canvas.width = rect.width
    this._canvas.height = rect.height

    this._canvas.style.margin = '0'
    this._canvas.style.padding = '0'
    this._canvas.style.transform = `scale(${zoomRatio})`
    this._canvas.style.imageRendering = 'pixelated'

    this._pendingTileSet = null

    // Remove any existing element with the same id
    const current = document.getElementById(id)
    if (current !== null) {
      if (current.parentNode === parentNode) {
        parentNode.replaceChild(this._canvas, current)
      } else throw new Error('ID ' + id + ' already exists in document!')
    } else parentNode.appendChild(this._canvas)

    this.ready = false
  }

  init(
    map,
    tileSet,
    spriteSheet,
    animationManager
  ) {

    if (arguments.length < 3) {
      throw new Error(
        'GameCanvas constructor called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    if (!tileSet.isValid) throw new Error('TileSet not ready!')

    this._spriteSheet = spriteSheet
    this._tileSet = tileSet
    const w = this._tileSet.tileWidth

    this._map = map
    this.animationManager = animationManager || new AnimationManager(map)

    if (this._canvas.width < w || this._canvas.height < w) { throw new Error('Canvas too small!') }

    // Whether to allow off-map scrolling
    this._allowScrolling = true

    // An array indexed by tile offset containing the tileValue last painted there
    this._lastPaintedTiles = null
    this._currentPaintedTiles = [] // for future use

    // Last time we painted, the canvas was this many tiles wide and tall
    this._lastPaintedWidth = -1
    this._lastPaintedHeight = -1

    // Last time we painted, the canvas was this wide and tall in pixels (determines whether we
    // can safely call putImageData)
    this._lastCanvasWidth = -1
    this._lastCanvasHeight = -1

    // After painting tiles, we store the image data here before painting sprites and mousebox
    this._lastCanvasData = null

    this._calculateDimensions()

    // Have the dimensions changed since the last paint?
    this._pendingDimensionChange = false
    const onResize = function (e) {
      this._pendingDimensionChange = true
    }.bind(this)

    // Recompute canvas dimensions on resize
    window.addEventListener('resize', onResize, false)

    // Order is important here. ready must be set before the call to centreOn below
    this.ready = true
    this.centreOn(
      Math.floor(this._map.width / 2),
      Math.floor(this._map.height / 2)
    )

    this.paint(null, null)
  }

  reset(map) {
    this._map = map
    // An array indexed by tile offset containing the tileValue last painted there
    this._lastPaintedTiles = null
    this._currentPaintedTiles = [] // for future use

    // Last time we painted, the canvas was this many tiles wide and tall
    this._lastPaintedWidth = -1
    this._lastPaintedHeight = -1

    // Last time we painted, the canvas was this wide and tall in pixels (determines whether we
    // can safely call putImageData)
    this._lastCanvasWidth = -1
    this._lastCanvasHeight = -1

    // After painting tiles, we store the image data here before painting sprites and mousebox
    this._lastCanvasData = null

    this._calculateDimensions()

    // Have the dimensions changed since the last paint?
    this._pendingDimensionChange = false

    this.ready = true
    this.centreOn(
      Math.floor(this._map.width / 2),
      Math.floor(this._map.height / 2)
    )

    this.paint(null, null)
  }

  _calculateDimensions(force) {

    force = force || false

    // The canvas is assumed to fill its container on-screen
    const canvasWidth = this.canvasWidth =
      this._canvas.parentNode.clientWidth
    const canvasHeight = this.canvasHeight =
      this._canvas.parentNode.clientHeight

    if (
      canvasHeight === this._lastCanvasHeight
    && canvasWidth === this._lastCanvasWidth
    && !force
    ) { return }

    this._canvas.width = canvasWidth
    this._canvas.height = canvasHeight

    const w = this._tileSet.tileWidth

    // How many tiles fit?
    this._wholeTilesInViewX = Math.floor(canvasWidth / w)
    this._wholeTilesInViewY = Math.floor(canvasHeight / w)
    this._totalTilesInViewX = Math.ceil(canvasWidth / w)
    this._totalTilesInViewY = Math.ceil(canvasHeight / w)

    if (this._allowScrolling) {

      // The min/max properties denote how far we will let the canvas' origin move: the map
      // should be visible in at least half the canvas

      this.minX = 0 // - Math.ceil(Math.floor(canvasWidth / w) / 2)
      this.maxX = this._map.width - 1
      // - this._wholeTilesInViewX
      - Math.ceil(Math.floor(canvasWidth / w) / 2) // Original
      // Subtract half of canvas based on zoomed tile
      - Math.floor(Math.floor(canvasWidth / (w * this.zoomRatio)) / 2)

      this.minY = 0 // - Math.ceil(Math.floor(canvasHeight / w) / 2)
      this.maxY = this._map.height - 1
      // - this._wholeTilesInViewY
      - Math.ceil(Math.floor(canvasHeight / w) / 2) // Original
      // Subtract half of canvas based on zoomed tile
      - Math.floor(Math.floor(canvasHeight / (w * this.zoomRatio)) / 2)

      // console.log('max', [this.maxX, this.maxY])

    } else {

      this.minX = 0
      this.minY = 0
      this.maxX = this._map.width - this._totalTilesInViewX
      this.maxY = this._map.height - this._totalTilesInViewY
    }

    this._pendingDimensionChange = true
  }

  // NOTE: Canvas must be visible when this is called
  disallowOffMap() {
    this._allowScrolling = false
    this._lastPaintedTiles = null
    this._calculateDimensions(true)
  }

  moveNorth() {
    if (!this.ready) return
    if (this._originY > this.minY) this._originY--
  }

  moveEast() {
    if (!this.ready) return
    if (this._originX < this.maxX) this._originX++
  }

  moveSouth() {
    if (!this.ready) return
    if (this._originY < this.maxY) this._originY++
  }

  moveWest() {
    if (!this.ready) return
    if (this._originX > this.minX) this._originX--
  }

  moveTo(x, y) {
    if (arguments.length < 1) { throw new Error('GameCanvas moveTo called with no arguments') }

    if (!this.ready) return

    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) { throw new Error('Coordinates out of bounds') }

    this._originX = x
    this._originY = y
  }

  centreOn(x, y) {
    if (arguments.length < 1) { throw new Error('GameCanvas centreOn called with no arguments') }

    if (!this.ready) throw new Error('Not ready!')

    if (y === undefined) {
      y = x.y
      x = x.x
    }

    // XXX Need to fix so that centres on best point if bounds fall outside
    // XXX min/max
    let originX = Math.floor(x) - Math.ceil(this._wholeTilesInViewX / 2)
    let originY = Math.floor(y) - Math.ceil(this._wholeTilesInViewY / 2)

    if (originX > this.maxX) originX = this.maxX
    if (originX < this.minX) originX = this.minX
    if (originY > this.maxY) originY = this.maxY
    if (originY < this.minY) originY = this.minY

    this._originX = originX
    this._originY = originY
  }

  getTileOrigin() {
    const e = new Error('Not ready!')

    if (!this.ready) throw e

    return { x: this._originX, y: this._originY }
  }

  getMaxTile() {
    const e = new Error('Not ready!')

    if (!this.ready) throw e

    return {
      x: this._originX + this._totalTilesInViewX - 1,
      y: this._originY + this._totalTilesInViewY - 1,
    }
  }

  canvasCoordinateToTileOffset(x, y) {
    if (arguments.length < 2) {
      throw new Error(
        'GameCanvas canvasCoordinateToTileOffset called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    if (!this.ready) throw new Error('Not ready!')

    return {
      x: Math.floor(x / this._tileSet.tileWidth / this.zoomRatio),
      y: Math.floor(y / this._tileSet.tileWidth / this.zoomRatio),
    }
  }

  canvasCoordinateToTileCoordinate(x, y) {
    if (arguments.length < 2) {
      throw new Error(
        'GameCanvas canvasCoordinateToTileCoordinate called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    if (!this.ready) throw new Error('Not ready!')

    const relativeWidth = this.canvasWidth * this.zoomRatio
    const relativeHeight = this.canvasHeight * this.zoomRatio
    if (x >= relativeWidth || y >= relativeHeight) return null

    const tileX = this._originX + Math.floor(x / this._tileSet.tileWidth / this.zoomRatio)
    const tileY = this._originY + Math.floor(y / this._tileSet.tileWidth / this.zoomRatio)

    // console.log([x, y], [tileX, tileY])

    return {
      x: tileX,
      y: tileY,
    }
  }

  canvasCoordinateToPosition(x, y) {
    if (arguments.length < 2) {
      throw new Error(
        'GameCanvas canvasCoordinateToPosition called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    if (!this.ready) throw new Error('Not ready!')

    const relativeWidth = this.canvasWidth * this.zoomRatio
    const relativeHeight = this.canvasHeight * this.zoomRatio
    if (x >= relativeWidth || y >= relativeHeight) return null

    x = this._originX + Math.floor(x / this._tileSet.tileWidth / this.zoomRatio)
    y = this._originY + Math.floor(y / this._tileSet.tileWidth / this.zoomRatio)

    if (x < 0 || x >= this._map.width || y < 0 || y >= this._map.height) { return null }

    return new Position(x, y)
  }

  positionToCanvasCoordinate(p) {
    if (arguments.length < 1) {
      throw new Error(
        'GameCanvas positionToCanvasCoordinate called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    return this.tileToCanvasCoordinate(p)
  }

  tileToCanvasCoordinate(x, y) {
    if (arguments.length < 1) {
      throw new Error(
        'GameCanvas tileToCanvasCoordinate  called with too few arguments '
        + [].toString.apply(arguments)
      )
    }

    if (!this.ready) throw new Error('Not ready!')

    if (y === undefined) {
      y = x.y
      x = x.x
    }

    if (
      x === undefined
    || y === undefined
    || x < this.minX
    || y < this.minY
    || x > this.maxX + this._totalTilesInViewX - 1
    || y > this.maxY + this._totalTilesInViewY - 1
    ) { throw e }

    if (
      x < this._originX
    || x >= this._originX + this._totalTilesInViewX
    || y < this._originY
    || y >= this._originY + this._totalTilesInViewY
    ) { return null }

    return {
      x: (x - this._originX) * this._tileSet.tileWidth * this.zoomRatio,
      y: (y - this._originY) * this._tileSet.tileWidth * this.zoomRatio,
    }
  }

  changeTileSet(tileSet) {
    if (!this.ready) throw new Error('Not ready!')

    if (!tileSet.isValid) throw new Error('new tileset not loaded')

    this._pendingTileSet = tileSet
  }

  _screenshot(onlyVisible) {
    if (onlyVisible) return this._canvas.toDataURL()

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this._map.width * this._tileSet.tileWidth
    //* this.zoomRatio
    tempCanvas.height = this._map.height * this._tileSet.tileWidth
    //* this.zoomRatio

    for (let x = 0; x < this._map.width; x++) {
      for (let y = 0; y < this._map.height; y++) {
        this._paintOne(this.ctx, this._map.getTileValue(x, y), x, y)
      }
    }
    return tempCanvas.toDataURL()
  }

  screenshotMap() {
    return this._screenshot(false)
  }

  screenshotVisible() {
    return this._screenshot(true)
  }

  shoogle() {
  // TODO Earthquakes
  }

  _processSprites(ctx, spriteList) {

    const spriteDamage = []
    const tileWidth = this._tileSet.tileWidth

    for (let i = 0, l = spriteList.length; i < l; i++) {
      const sprite = spriteList[i]
      try {
        ctx.drawImage(
          this._spriteSheet,
          (sprite.frame - 1) * 48,
          (sprite.type - 1) * 48,
          sprite.width,
          sprite.width,
          sprite.x + sprite.xOffset - this._originX * 16,
          sprite.y + sprite.yOffset - this._originY * 16,
          sprite.width,
          sprite.width
        )
      } catch (e) {
      // throw new Error
        console.warn(
          'Failed to draw sprite '
          + sprite.type
          + ' frame '
          + sprite.frame
          + ' at '
          + sprite.x
          + ', '
          + sprite.y
        )
        continue
      }

      // sprite values are in pixels
      spriteDamage.push({
        x: Math.floor(
          (sprite.x + sprite.xOffset - this._originX * 16) / tileWidth
        ),
        xBound: Math.ceil(
          (sprite.x + sprite.xOffset + sprite.width - this._originX * 16)
          / tileWidth
        ),
        y: Math.floor(
          (sprite.y + sprite.yOffset - this._originY * 16) / tileWidth
        ),
        yBound: Math.ceil(
          (sprite.y + sprite.yOffset + sprite.height - this._originY * 16)
          / tileWidth
        ),
      })
    }

    return spriteDamage
  }

  // Draws a mouse outline around the selected tiles. The mouse object is assumed to contain x and y properties which
  // express the coordinate of the top-left of the box in terms of the number of tiles from the top left. It should
  // also contain a width and height that are again expressed in terms of the number of tiles. The colour property
  // naturally defines the colour of the painted box.
  _processMouse(mouse) {

    const damage = { x: 0, xBound: 0, y: 0, yBound: 0 }

    if (mouse.width === 0 || mouse.height === 0) return

    // For outlines bigger than 2x2 (in either dimension) assume the mouse is offset by
    // one tile
    let mouseX = mouse.x
    let mouseY = mouse.y
    const mouseWidth = mouse.width
    const mouseHeight = mouse.height
    const options = { colour: mouse.colour, outline: true }

    if (mouseWidth > 2) mouseX -= 1
    if (mouseHeight > 2) mouseY -= 1

    const offMap =
      (this._originX + mouseX < 0
        && this._originX + mouseX + mouseWidth <= 0)
      || (this._originY + mouseY < 0
        && this._originY + mouseY + mouseHeight <= 0)
      || this._originX + mouseX >= this._map.width
      || this._originY + mouseY >= this._map.height

    if (offMap) {
      damage.x = damage.xBound = mouseX
      damage.y = damage.yBound = mouseY
      return damage
    }

    const pos = {
      x: mouseX * this._tileSet.tileWidth,
      y: mouseY * this._tileSet.tileWidth,
    }
    const width = mouseWidth * this._tileSet.tileWidth
    const height = mouseHeight * this._tileSet.tileWidth

    MouseBox.draw(this._canvas, pos, width, height, options)

    // Return an object representing tiles that were damaged that will need redrawn
    // Note that we must take an extra tile either side to account for the outline
    damage.x = mouseX - 1
    damage.xBound = mouseX + mouseWidth + 2
    damage.y = mouseY - 1
    damage.yBound = mouseY + mouseWidth + 2
    return damage
  }


  _paintVoid(ctx, x, y) {
    const w = this._tileSet.tileWidth
    ctx.fillStyle = 'black'
    ctx.fillRect(x * w, y * w, w, w)
  }

  _paintOne(ctx, tileVal, x, y) {
    if (tileVal === TILE_INVALID) {
      this._paintVoid(ctx, x, y)
      return
    }

    const src = this._tileSet[tileVal]
    try {
      ctx.drawImage(
        src,
        x * this._tileSet.tileWidth,
        y * this._tileSet.tileWidth
      )
    } catch (e) {
      const mapX = this._originX + x
      const mapY = this._originY + y
      throw new Error(
        'Failed to draw tile '
        + tileVal
        + ' at '
        + x
        + ', '
        + y
        + ' (map '
        + mapX
        + ', '
        + mapY
        + ' tile '
        + (this._map.testBounds(mapX, mapY)
          ? this._map.getTileValue(mapX, mapY)
          : '?? (Out of bounds)')
        + ')'
      )
    }
  }

  _paintTiles(ctx, paintData) {
    let x, y, row, index
    const lastPaintedTiles = this._lastPaintedTiles

    const width = this._totalTilesInViewX
    const height = this._totalTilesInViewY

    if (lastPaintedTiles !== null) {
    // We have painted the canvas before. There are 3 possibilities:
    //  - The canvas is exactly the same size as last time we painted
    //  - The canvas has grown
    //  - The canvas has shrunk
    //
    // In any case, we want to find the minimal area that was onscreen last paint
    // and this paint, and iterate over those tiles, repainting where necessary
      const xBound = Math.min(this._lastPaintedWidth, width)
      const yBound = Math.min(this._lastPaintedHeight, height)

      // Loop over the common area that we painted last time. Compare the current value against what was there last time
      for (y = 0; y < yBound; y++) {
        for (x = 0; x < xBound; x++) {
          index = y * xBound + x
          if (lastPaintedTiles[index] === paintData[index]) continue

          // Tile is different: repaint
          this._paintOne(ctx, paintData[index], x, y)
        }
      }

      // Do we have more tiles than before? Paint the extra width and/or the extra height
      if (width > this._lastPaintedWidth) {
        for (y = 0; y < height; y++) {
          for (x = this._lastPaintedWidth; x < width; x++) {
            index = y * width + x
            this._paintOne(ctx, paintData[index], x, y)
          }
        }
      }

      if (height > this._lastPaintedHeight) {
        for (y = this._lastPaintedHeight; y < height; y++) {
          for (x = 0; x < width; x++) {
            index = y * width + x
            this._paintOne(ctx, paintData[index], x, y)
          }
        }
      }
    } else {
    // Full paint
      for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
          index = y * width + x
          this._paintOne(ctx, paintData[index], x, y)
        }
      }
    }

    // Stash data
    this._lastPaintedWidth = width
    this._lastPaintedHeight = height

    // Rotate tile data
    const temp = this._lastPaintedTiles
    this._lastPaintedTiles = paintData
    this._currentPaintedTiles = temp
  }

  paint(mouse, sprites, isPaused) {

    let i, l, x, y, row, damaged, xBound, yBound, index

    if (!this.ready) {
    // throw new Error('Not ready!')
      return
    }

    let lastPaintedTiles = this._lastPaintedTiles

    // Recompute our dimensions if there has been a resize since last paint
    if (this._pendingDimensionChange || this._pendingTileSet) {

      this._calculateDimensions()
      this._pendingDimensionChange = false

      // Change tileSet if necessary
      if (this._pendingTileSet !== null) this._tileSet = this._pendingTileSet

      // If the dimensions or tileset has changed, set each entry in lastPaintedTiles to a bogus value to force a
      // repaint. Note: we use -2 as our bogus value; -1 would paint the black void
      if (
        this._pendingTileSet
        || this.canvasWidth !== this._lastCanvasWidth
        || this.canvasHeight !== this._lastCanvasHeight
      ) {

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        for (
          y = 0, l = lastPaintedTiles !== null ? lastPaintedTiles.length : 0;
          y < l;
          y++
        ) { lastPaintedTiles[y] = -2 }

      }

      this._pendingTileSet = null
    }

    const paintWidth = this._totalTilesInViewX
    const paintHeight = this._totalTilesInViewY

    // Fill an array with the values we need to paint
    const tileValues = this._map.getTileValuesForPainting(
      this._originX,
      this._originY,
      paintWidth,
      paintHeight,
      this._currentPaintedTiles
    )

    // Adjust for animations
    this.animationManager.getTiles(
      tileValues,
      this._originX,
      this._originY,
      paintWidth,
      paintHeight,
      isPaused
    )

    this._paintTiles(this.ctx, tileValues)
    // The _paintTiles call updates this._lastPaintedTiles. Update our cached copy
    lastPaintedTiles = this._lastPaintedTiles

    // Stash various values for next paint
    this._lastCanvasWidth = this.canvasWidth
    this._lastCanvasHeight = this.canvasHeight

    if (!mouse && !sprites) {
      return
    }

    if (mouse) {

      damaged = this._processMouse(mouse)

      for (
        y = Math.max(0, damaged.y),
        yBound = Math.min(paintHeight, damaged.yBound);
        y < yBound;
        y++
      ) {
        for (
          x = Math.max(0, damaged.x),
          xBound = Math.min(paintWidth, damaged.xBound);
          x < xBound;
          x++
        ) {
          index = [y * paintWidth + x]
          // Note: we can't use TILE_INVALID (-1) as that in some sense is a valid tile for the void!
          lastPaintedTiles[index] = -2
        }
      }
    }

    if (sprites) {

      damaged = this._processSprites(this.ctx, sprites)

      for (i = 0, l = damaged.length; i < l; i++) {
        const damagedArea = damaged[i]
        for (
          y = Math.max(0, damagedArea.y),
          yBound = Math.min(damagedArea.yBound, paintHeight);
          y < yBound;
          y++
        ) {
          for (
            x = Math.max(0, damagedArea.x),
            xBound = Math.min(damagedArea.xBound, paintWidth);
            x < xBound;
            x++
          ) {
            index = [y * paintWidth + x]
            this._lastPaintedTiles[index] = -2
          }
        }
      }
    }
  }

}

export { GameCanvas }
