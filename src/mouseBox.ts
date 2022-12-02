const MouseBox = {
  draw: function (c, pos, width, height, options) {
    const lineWidth = options.lineWidth || 3.0
    const strokeStyle = options.colour || 'yellow'
    const shouldOutline =
      ('outline' in options && options.outline === true) || false

    let startModifier = -1
    let endModifier = 1
    if (!shouldOutline) {
      startModifier = 1
      endModifier = -1
    }

    const startX = pos.x + (startModifier * lineWidth) / 2
    width = width + endModifier * lineWidth
    const startY = pos.y + (startModifier * lineWidth) / 2
    height = height + endModifier * lineWidth

    const ctx = c.getContext('2d')
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.strokeRect(startX, startY, width, height)
  },
}

export { MouseBox }
