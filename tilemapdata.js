TilemapData.prototype = new TilemapData();
TilemapData.prototype.constructor = TilemapData;

function MapTileData(x, y, terrain, production, buff, owner) {
  this.x = x;
  this.y = y;
  this.terrain = terrain;
  this.production = production;
  this.buff = buff;
  this.owner = owner;
}

function TilemapData(mapWidth, mapHeight){
  this.data = Array.from(Array(mapHeight), () => new Array(mapWidth));
  this.startLocation = {x: 0, y: 0};

  this.width = mapWidth;
  this.height = mapHeight;
}

TilemapData.prototype.addMapTileData = function(x, y, terrain){
  var tile = new MapTileData(x, y, terrain, 0, 0, 0);
  this.data[y][x] = tile;
}

TilemapData.prototype.changeMapTileData = function(x, y, terrain){
  var mapItem = this.data[y][x];
  mapItem.terrain = terrain;
}

TilemapData.prototype.getMapTileData = function(x, y){
  return this.data[y][x];
}

TilemapData.prototype.generateMapData = function(){
  // fill with ocean

  for (y = 0; y < mapHeight; y++) {
    for (x = 0; x < mapWidth; x++) {
      this.addMapTileData(x, y, 0);
    }
  }

  // spawn some landmasses
  for(var j=0; j<landTotal; j++){ //number of landmasses
    for(var i=0; i<landSize; i++){ //size seed of landmasses
      this.spawnLandmassData(Math.floor(i / 2) + 1,
                         Math.floor(Math.random()*mapWidth),
                         Math.floor(Math.random()*mapHeight));
    }
  }

  // starting location
  var found = false;
  while(!found){
    var x = Math.floor(Math.random() * mapWidth);
    var y = Math.floor(Math.random() * mapHeight);
    var tile = this.getMapTileData(x, y);
    if(tile.terrain == 2){
      this.changeMapTileData(x, y, 5);
      this.startLocation.x = x;
      this.startLocation.y = y;
      found = true;
    }
  }

}

TilemapData.prototype.spawnLandmassData = function(landSize, x, y){
  x = Math.max(x, 0);
  x = Math.min(x, mapWidth - 1);
  y = Math.max(y, 0);
  y = Math.min(y, mapHeight - 1);

  if(this.getMapTileData(x, y).terrain < landSize){
    this.changeMapTileData(x, y, Math.min(4, Math.max(1, Math.floor(landSize /
                                                             (Math.random() + 0.9)))));
  }

  for(var i = 0; i<landSize; i++){
    var horiz = Math.floor(Math.random() * 3) - 1;
    var vert = Math.floor(Math.random() * 3) - 1;
    this.spawnLandmassData(landSize - 1, x + horiz, y + vert);
  }
}