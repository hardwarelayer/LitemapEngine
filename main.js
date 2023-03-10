// define a few globals here
var stage = null;
var renderer = null;
var renderWidth = 800;
var renderHeight = 600;

var mapData = null;
var tilemap = null;
var overlay = null;
var menu = null;
var menuBarWidth = 120;

var mapWidth = 64;
var mapHeight = 50;
var landTotal = 18; //25
var landSize = 15; //12

var selX = 0;
var selY = 0;

function Main(tilesPath, w, h){
  // For zoomed-in pixel art, we want crisp pixels instead of fuzziness
  PIXI.settings.SCALE_MODES = PIXI.SCALE_MODES.NEAREST;

  // Create the stage. This will be used to add sprites (or sprite containers) to the screen.
  stage = new PIXI.Container();

  // Create the renderer and add it to the page.
  // (autoDetectRenderer will choose hardware accelerated if possible)
  if(w != 0 && h != 0){
    renderWidth = w;
    renderHeight = h;
  }
  renderer = PIXI.autoDetectRenderer(renderWidth, renderHeight);

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

  mapData = new TilemapData(mapWidth, mapHeight, landTotal, landSize);
  mapData.generateMapData();

  tilemap = new TilemapEx(mapData.data, mapData.startLocation);
  tilemap.position.x = menuBarWidth;

  overlay = new TilemapOverlay(mapData.data);
  overlay.position.x = menuBarWidth;
  stage.addChild(tilemap, overlay);

  menu = new Menu();
  stage.addChild(menu);
  // zoom in on the starting tile
  tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y);
  tilemap.zoomIn();
  overlay.selectTile(tilemap.startLocation.x, tilemap.startLocation.y);
  overlay.zoomIn();

  stage.addEventListener("evt_mouse_down", function(evt, x, y) {
    overlay.mouseDown(evt);
    selX = x;
    selY = y;
    console.log("select tile ", x, y);

    console.log(mapData.getMapTileData(x,y));
  });
  stage.addEventListener("evt_mouse_drag", function(evt) {
    overlay.mouseDrag(evt);
  });
  stage.addEventListener("side_menu_event", function(menuCmd) {
    console.log(menuCmd);
    if (menuCmd == "zoom_out") {
      tilemap.zoomOut();
      overlay.zoomOut();
    }
    else if (menuCmd == "zoom_in") {
      tilemap.zoomIn();
      overlay.zoomIn();
    }
    else if (menuCmd == "change_tile") {
      tilemap.changeTile(selX, selY, "6");
    }
    else if (menuCmd == "add_char") {
      overlay.changeTile(selX, selY, "man");
    }
    else if (menuCmd == "remove_char") {
      overlay.changeTile(selX, selY, "transparent");
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
