function TileHistory() {
  this.clear()
}

const toKey = function (x, y) {
  return [x, y].join(',')
}

TileHistory.prototype.clear = function () {
  this.data = {}
}

TileHistory.prototype.getTile = function (x, y) {
  const key = toKey(x, y)
  return this.data[key]
}

TileHistory.prototype.setTile = function (x, y, value) {
  const key = toKey(x, y)
  this.data[key] = value
}

export { TileHistory }
