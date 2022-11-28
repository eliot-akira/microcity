var MouseBox = {
  draw: function (c, pos, width, height, options) {
    var lineWidth = options.lineWidth || 3.0
    var strokeStyle = options.colour || 'yellow'
    var shouldOutline =
      ('outline' in options && options.outline === true) || false

    var startModifier = -1
    var endModifier = 1
    if (!shouldOutline) {
      startModifier = 1
      endModifier = -1
    }

    var startX = pos.x + (startModifier * lineWidth) / 2
    width = width + endModifier * lineWidth
    var startY = pos.y + (startModifier * lineWidth) / 2
    height = height + endModifier * lineWidth

    var ctx = c.getContext('2d')
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.strokeRect(startX, startY, width, height)
  },
}

export { MouseBox }
