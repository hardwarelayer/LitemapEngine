TilemapEx.prototype = new PIXI.Container();
TilemapEx.prototype.constructor = TilemapEx;

function TilemapEx(arrData, startLoc) {
  if (arrData.length < 1) return;
  this.tilesWidth = arrData[0].length;
  this.tilesHeight = arrData.length;

  this.mapData = arrData;

  this.startLocation = { x: startLoc.x, y: startLoc.y };

  var myObj = new PIXI.Container(this);
  this.interactive = true;

  this.tileSize = 16;
  this.zoom = 2;
  this.scale.x = this.scale.y = this.zoom;

  // fill the map with tiles
  this.loadMapData();
  //this.generateMap();

  // variables and functions for moving the map
  this.mouseoverTileCoords = [0, 0];
  this.selectedTileCoords = [0, 0];
  this.mousePressPoint = [0, 0];
  this.selectedGraphics = new PIXI.Graphics();
  this.mouseoverGraphics = new PIXI.Graphics();
  this.addChild(this.selectedGraphics);
  this.addChild(this.mouseoverGraphics);

  this.on('mousedown', this.mouseDown);
  this.on('touchstart', this.mouseDown);
  this.on('mouseup', this.mouseUp);
  this.on('mouseupoutside', this.mouseUp);
  this.on('touchend', this.mouseUp);
  this.on('touchendoutside', this.mouseUp);
  this.on('mousemove', this.mouseMove);
  this.on('touchmove', this.mouseMove);
}

TilemapEx.prototype.mouseMove = function(evt) {

  if(this.dragging)
  {
    var position = evt.client;
    this.position.x = position.x - this.mousePressPoint[0];
    this.position.y = position.y - this.mousePressPoint[1];

    this.constrainTilemapEx();

    this.parent.emit('evt_mouse_drag', evt);
  }
  else{
    var mouseOverPoint = [0, 0];
    mouseOverPoint[0] = evt.client.x - this.position.x;
    mouseOverPoint[1] = evt.client.y - this.position.y;

    var selX = Math.floor(mouseOverPoint[0] / (this.tileSize * this.zoom));
    var selY = Math.floor(mouseOverPoint[1] / (this.tileSize * this.zoom));
    //a fix for small zoomlevel 1,2
    if (this.zoom <= 2 && selY > 0) selY -= 1;

    var mouseoverTileCoords = [selX, selY];
    this.mouseoverGraphics.clear();
    this.mouseoverGraphics.lineStyle(1, 0xFFFFFF, 1);
    this.mouseoverGraphics.beginFill(0x000000, 0);
    this.mouseoverGraphics.drawRect(mouseoverTileCoords[0] * this.tileSize,
                          mouseoverTileCoords[1] * this.tileSize,
                          this.tileSize - 1,
                          this.tileSize - 1);
    this.mouseoverGraphics.endFill();
  }
}

TilemapEx.prototype.mouseUp = function(evt) {
  this.dragging = false;
}

TilemapEx.prototype.mouseDown = function (evt) {

  if(evt.client.x > menuBarWidth) {
    this.dragging = true;
    this.mousePressPoint[0] = evt.client.x - this.position.x;
    this.mousePressPoint[1] = evt.client.y - this.position.y;

    var selX = Math.floor(this.mousePressPoint[0] / (this.tileSize * this.zoom));
    var selY = Math.floor(this.mousePressPoint[1] / (this.tileSize * this.zoom));

    //a fix for small zoomlevel 1,2
    if (this.zoom <= 2 && selY > 0) selY -= 1;

    this.selectTile(selX, selY);

    this.parent.emit('evt_mouse_down', evt, selX, selY);
  }
}

TilemapEx.prototype.addTile = function(x, y, terrain){
  var tile = PIXI.Sprite.from(terrain.toString());
  tile.position.x = x * this.tileSize;
  tile.position.y = y * this.tileSize;
  tile.tileX = x;
  tile.tileY = y;
  tile.terrain = terrain;
  zindex = x * this.tilesHeight + y; //because we fill from left, topdown
  this.addChildAt(tile, zindex);
}

TilemapEx.prototype.changeTile = function(x, y, terrain){
  this.removeChild(this.getTile(x, y));
  this.addTile(x, y, terrain);
}

TilemapEx.prototype.getTile = function(x, y){
  zindex = x * this.tilesHeight + y; //because we fill from left, topdown
  return this.getChildAt(zindex);
}

TilemapEx.prototype.loadMapData = function(){
  // fill with ocean, each by each cols, from left, topdown
  for(var i = 0; i < this.tilesWidth; ++i){
    var currentRow = [];
    for(var j=0; j < this.tilesHeight; j++){
      this.addTile(i, j, this.mapData[j][i].terrain);
    }
  }
}

TilemapEx.prototype.selectTile = function(x, y){
  this.selectedTileCoords = [x, y];
  menu.selectedTileText.text = "Selected Tile: " + this.selectedTileCoords;
  this.selectedGraphics.clear();
  this.selectedGraphics.lineStyle(2, 0xFFFF00, 1);
  this.selectedGraphics.beginFill(0x000000, 0);
  this.selectedGraphics.drawRect(this.selectedTileCoords[0] * this.tileSize,
                         this.selectedTileCoords[1] * this.tileSize,
                         this.tileSize,
                         this.tileSize);
  this.selectedGraphics.endFill();
}

TilemapEx.prototype.zoomIn = function(){
  this.zoom = Math.min(this.zoom * 2, 8);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemapEx();
}

TilemapEx.prototype.zoomOut = function(){
  this.mouseoverGraphics.clear();

  this.zoom = Math.max(this.zoom / 2, 1);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemapEx();
}

TilemapEx.prototype.centerOnSelectedTile = function(){
  this.position.x = (renderWidth - menuBarWidth) / 2 -
    this.selectedTileCoords[0] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2 + menuBarWidth;
  this.position.y = renderHeight / 2 -
    this.selectedTileCoords[1] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2;
}

TilemapEx.prototype.constrainTilemapEx = function(){
  this.position.x = Math.max(this.position.x, -1 * this.tileSize * this.tilesWidth * this.zoom + renderWidth);
  this.position.x = Math.min(this.position.x, menuBarWidth);
  this.position.y = Math.max(this.position.y, -1 * this.tileSize * this.tilesHeight * this.zoom + renderHeight);
  this.position.y = Math.min(this.position.y, 0);
}