import { TILE_COUNT } from './tileValues'

// Tiles must be 16px square
const TILE_SIZE = 16
const TILES_PER_ROW = Math.sqrt(TILE_COUNT)
const ACCEPTABLE_DIMENSION = TILES_PER_ROW * TILE_SIZE

class TileSet {

  constructor(image, callback, errorCallback) {
  // if (!(this instanceof TileSet)) { return new TileSet(image, callback, errorCallback) }

    if (callback === undefined || errorCallback === undefined) {
      if (callback === undefined && errorCallback === undefined) {
        throw new Error(
          'Tileset constructor called with no callback or errorCallback'
        )
      } else {
        throw new Error(
          'Tileset constructor called with no '
          + (callback === undefined ? 'callback' : 'errorCallback')
        )
      }
    }

    this.isValid = false

    // if (!(image instanceof Image)) {
    //   // Spin the event loop
    //   window.setTimeout(errorCallback, 0)
    //   return
    // }

    // Verify image
    const width = image.width
    const height = image.height

    // We expect tilesets to be square, and of the required width/height
    if (width !== height || width !== ACCEPTABLE_DIMENSION) {
    // // Spin the event loop
    // window.setTimeout(errorCallback, 0)
    // return
    }

    const tileWidth = (this.tileWidth = TILE_SIZE)

    // We paint the image onto a canvas so we can split it up
    const c = document.createElement('canvas')
    c.width = tileWidth
    c.height = tileWidth
    const cx = c.getContext('2d')

    // Count how many tiles we have created
    const tileCount = TILE_COUNT
    let notifications = 0
    const self = this

    // Callback triggered by an image load. Checks to see if we are done creating images,
    // and if so notifies the caller.
    const imageLoad = function () {
      notifications++

      if (notifications === tileCount) {
        self.isValid = true
        // Spin the event loop
        window.setTimeout(callback, 0)

      }
    }

    // Break up the source image into tiles by painting each tile onto a canvas, computing the dataURI
    // of the canvas, and using that to create a new image, which we install on ourselves as a new property
    for (let i = 0; i < tileCount; i++) {
      cx.clearRect(0, 0, tileWidth, tileWidth)

      const sourceX = (i % TILES_PER_ROW) * tileWidth
      const sourceY = Math.floor(i / TILES_PER_ROW) * tileWidth
      cx.drawImage(
        image,
        sourceX,
        sourceY,
        tileWidth,
        tileWidth,
        0,
        0,
        tileWidth,
        tileWidth
      )

      this[i] = new Image()
      this[i].onload = imageLoad
      this[i].src = c.toDataURL()
    }
  }

}

export { TileSet }
