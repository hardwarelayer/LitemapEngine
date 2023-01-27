TilemapOverlay.prototype = new PIXI.Container();
TilemapOverlay.prototype.constructor = TilemapOverlay;

function TilemapOverlay(arrData) {
  if (arrData.length < 1) return;
  this.tilesWidth = arrData[0].length;
  this.tilesHeight = arrData.length;

  this.mapData = arrData;

  var myObj = new PIXI.Container(this);
  this.interactive = false; //not use mouse/pointer/touch

  this.tileSize = 16;
  this.zoom = 2;
  this.scale.x = this.scale.y = this.zoom;

  // fill the map with tiles
  this.loadMapData();
  //this.generateMap();

  // variables and functions for moving the map
  this.mousePressPoint = [0, 0];
  this.selectedTileCoords = [0, 0];
}

TilemapOverlay.prototype.mouseDown = function(evt) {
  //because we actually have no mouse press point in this layer, so we have to clone from the interractive layer (same size)
  this.mousePressPoint[0] = evt.client.x - this.position.x;
  this.mousePressPoint[1] = evt.client.y - this.position.y;

  var selX = Math.floor(this.mousePressPoint[0] / (this.tileSize * this.zoom));
  var selY = Math.floor(this.mousePressPoint[1] / (this.tileSize * this.zoom));

  //a fix for small zoomlevel 1,2
  if (this.zoom <= 2 && selY > 0) selY -= 1;

  this.selectTile(selX, selY); //we have to readjust to sync with tilemap layer
}

TilemapOverlay.prototype.mouseDrag = function(evt) {
  var position = evt.client;
  this.position.x = position.x - this.mousePressPoint[0];
  this.position.y = position.y - this.mousePressPoint[1];

  this.constrainTilemapOverlay();
}

TilemapOverlay.prototype.addTile = function(x, y, terrain){
  var tile = PIXI.Sprite.from("transparent");
  tile.position.x = x * this.tileSize;
  tile.position.y = y * this.tileSize;
  tile.tileX = x;
  tile.tileY = y;
  tile.terrain = terrain;
  zindex = x * this.tilesHeight + y; //because we fill from left, topdown
  if (x != 3) 
    this.addChildAt(tile, zindex);
  else {
    var tile2 = PIXI.Sprite.from("man");
    tile2.position.x = x * this.tileSize;
    tile2.position.y = y * this.tileSize;
    tile2.tileX = x;
    tile2.tileY = y;
    tile2.terrain = terrain;
    this.addChildAt(tile2, zindex);
  }
}

TilemapOverlay.prototype.changeTile = function(x, y, terrain){
  this.removeChild(this.getTile(x, y));
  this.addTile(x, y, terrain);
}

TilemapOverlay.prototype.getTile = function(x, y){
  zindex = x * this.tilesHeight + y; //because we fill from left, topdown
  return this.getChildAt(zindex);
}

TilemapOverlay.prototype.loadMapData = function(){
  // fill with ocean, each by each cols, from left, topdown
  for(var i = 0; i < this.tilesWidth; ++i){
    var currentRow = [];
    for(var j=0; j < this.tilesHeight; j++){
      this.addTile(i, j, this.mapData[j][i].terrain);
    }
  }
}

TilemapOverlay.prototype.selectTile = function(x, y){
  this.selectedTileCoords = [x, y];
}

TilemapOverlay.prototype.zoomIn = function(){
  this.zoom = Math.min(this.zoom * 2, 8);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemapOverlay();
}

TilemapOverlay.prototype.zoomOut = function(){
  this.zoom = Math.max(this.zoom / 2, 1);
  this.scale.x = this.scale.y = this.zoom;

  this.centerOnSelectedTile();
  this.constrainTilemapOverlay();
}

TilemapOverlay.prototype.centerOnSelectedTile = function(){
  this.position.x = (renderWidth - menuBarWidth) / 2 -
    this.selectedTileCoords[0] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2 + menuBarWidth;
  this.position.y = renderHeight / 2 -
    this.selectedTileCoords[1] * this.zoom * this.tileSize -
    this.tileSize * this.zoom / 2;
}

TilemapOverlay.prototype.constrainTilemapOverlay = function(){
  this.position.x = Math.max(this.position.x, -1 * this.tileSize * this.tilesWidth * this.zoom + renderWidth);
  this.position.x = Math.min(this.position.x, menuBarWidth);
  this.position.y = Math.max(this.position.y, -1 * this.tileSize * this.tilesHeight * this.zoom + renderHeight);
  this.position.y = Math.min(this.position.y, 0);
}