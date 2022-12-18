# Notes

## Improve

- Correctly redraw canvas on zoom in beyond 1
- Prevent park tool from building over trees
- More efficient DOM queries - For example, reduce repeated calls of `$('.selected')`, `$(this.canvasID)`
- x Screenshot too big by zoomRatio

## Develop features

- Overviews
- Better navigation
  - Macintosh-style scroll bar for map
  - Mouse and touch drag to move around the map 
- Sounds
- [x] Generate new city
- [x] Export/import city
- [x] Control panel with tool icons

## Tools

- Residential $100
- Commercial $100
- Industrial $100
- Road $10
- Rail $20
- Wire $5
- Bulldozer $1
- Query - TODO: Instead of opening a modal window on click, show info under cursor as it moves

- Park $10 - Test if dragging to draw line of parks works
- Nuclear $5000
- Coal $3000
- Police $500
- Fire $500

- Port $3000
- Stadium $5000
- Airport $10000


## Zoom in/out

See gameCanvas.ts

this.zoomRatio
this._tileSet.tileWidth
