// define a few globals here
var stage = null;
var renderer = null;
var renderWidth = 800;
var renderHeight = 600;

var tilemap = null;
var overlay = null;
var menu = null;
var menuBarWidth = 120;

var mapData = null;
var startLocation = null;
var mapWidth = 64;
var mapHeight = 50;
var landTotal = 10; //25
var landSize = 10; //12

function MapData(x, y, terrain, production, buff, owner) {
  this.x = x;
  this.y = y;
  this.terrain = terrain;
  this.production = production;
  this.buff = buff;
  this.owner = owner;
}

function StartLocation(x, y) {
  this.x = x;
  this.y = y;
}

function addMapData(x, y, terrain){
  var tile = new MapData(x, y, terrain, 0, 0, 0);
  mapData[y][x] = tile;
}

function changeMapData(x, y, terrain){
  var mapItem = this.mapData[y][x];
  mapItem.terrain = terrain;
}

function getMapData(x, y){
  return mapData[y][x];
}

function generateMapData(){
  // fill with ocean

  for (y = 0; y < mapHeight; y++) {
    for (x = 0; x < mapWidth; x++) {
      addMapData(x, y, 0);
    }
  }

  // spawn some landmasses
  for(var j=0; j<landTotal; j++){ //number of landmasses
    for(var i=0; i<landSize; i++){ //size seed of landmasses
      spawnLandmassData(Math.floor(i / 2) + 1,
                         Math.floor(Math.random()*mapWidth),
                         Math.floor(Math.random()*mapHeight));
    }
  }

  // starting location
  var found = false;
  while(!found){
    var x = Math.floor(Math.random() * mapWidth);
    var y = Math.floor(Math.random() * mapHeight);
    var tile = getMapData(x, y);
    if(tile.terrain == 2){
      changeMapData(x, y, 5);
      startLocation = new StartLocation(x, y);
      found = true;
    }
  }

}

function spawnLandmassData(landSize, x, y){
  x = Math.max(x, 0);
  x = Math.min(x, mapWidth - 1);
  y = Math.max(y, 0);
  y = Math.min(y, mapHeight - 1);

  if(getMapData(x, y).terrain < landSize){
    changeMapData(x, y, Math.min(4, Math.max(1, Math.floor(landSize /
                                                             (Math.random() + 0.9)))));
  }

  for(var i = 0; i<landSize; i++){
    var horiz = Math.floor(Math.random() * 3) - 1;
    var vert = Math.floor(Math.random() * 3) - 1;
    spawnLandmassData(landSize - 1, x + horiz, y + vert);
  }
}

function globalZoomin() {
  tilemap.zoomIn();
  overlay.zoomIn();
}

function globalZoomout() {
  tilemap.zoomOut();
  overlay.zoomOut();
}

function Main(tilesPath, w, h){
  // For zoomed-in pixel art, we want crisp pixels instead of fuzziness
  PIXI.settings.SCALE_MODES = PIXI.SCALE_MODES.NEAREST;

  // Create the stage. This will be used to add sprites (or sprite containers) to the screen.
  stage = new PIXI.Container();//Stage(0x888888);

  // Create the renderer and add it to the page.
  // (autoDetectRenderer will choose hardware accelerated if possible)
  if(w != 0 && h != 0){
    renderWidth = w;
    renderHeight = h;
  }
  renderer = PIXI.autoDetectRenderer(renderWidth, renderHeight);

  //document.body.appendChild(renderer.view);

  // Set up the asset loader for sprite images with the .json data and a callback
  var tileAtlas = [tilesPath + "tiles.json"];
  var moreTileAtlas = [tilesPath + "more_tiles.json"];

  var loader = PIXI.Assets;
  loader.load(tileAtlas).then(() => {
    loader.load(moreTileAtlas).then(() => {
      onLoaded();
    });
  });

  return renderer.view;
}

// called when sprites are finished loading
function onLoaded(){

  mapData = Array.from(Array(mapHeight), () => new Array(mapWidth));
  generateMapData();

  tilemap = new TilemapEx(mapData, startLocation);
  tilemap.position.x = menuBarWidth;

  overlay = new TilemapOverlay(mapData);
  overlay.position.x = menuBarWidth;
  stage.addChild(tilemap, overlay);

  menu = new Menu(globalZoomin, globalZoomout);
  stage.addChild(menu);
  // zoom in on the starting tile
  tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y);
  tilemap.zoomIn();
  overlay.selectTile(tilemap.startLocation.x, tilemap.startLocation.y);
  overlay.zoomIn();

  stage.addEventListener("evt_mouse_down", function(evt) {
    overlay.mouseDown(evt);
  });
  stage.addEventListener("evt_mouse_drag", function(evt) {
    overlay.mouseDrag(evt);
  });
  stage.addEventListener("side_menu_event", function(menuCmd) {
    if (menuCmd == "zoom_out") {
      tilemap.zoomOut();
      overlay.zoomOut();
    }
    else if (menuCmd == "zoom_in") {
      tilemap.zoomIn();
      overlay.zoomIn();
    }
  });

  // begin drawing
  requestAnimationFrame(animate);
}

function onError() {
  console.log("Error while loading resources!");
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(stage);
}
