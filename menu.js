Menu.prototype = new PIXI.Container();
Menu.prototype.constructor = Menu;

function Menu(){

  new PIXI.Container(this);
  this.interactive = true;

  this.background = new PIXI.Graphics();
  this.background.lineStyle(1, 0x000000, 1);
  this.background.beginFill(0xA08000, 1);
  this.background.drawRect(menuBarWidth - 4, 0, 4, 800);
  this.background.endFill();
  this.background.lineStyle(0, 0x000000, 1);
  this.background.beginFill(0x203040, 1);
  this.background.drawRect(0, 0, menuBarWidth - 4, 800);
  this.background.endFill();
  this.addChild(this.background);

  this.selectedTileText = new PIXI.Text("Selected Tile: " + 1);
  const tileTextStyle = new PIXI.TextStyle(
    { fontSize: "10p", fontFamily: " Arial", fill: "#FFFFFF", align: "left"}
    );
  this.selectedTileText.style = tileTextStyle;
  this.addChild(this.selectedTileText);

  var w = this.addMenuButton("+", 0, 12, 'zoom_in', 40);
  w = this.addMenuButton("-", w+1, 12, 'zoom_out', 40);
  this.addMenuButton("Change Tile", 0, 60, 'change_tile', 12);
  this.addMenuButton("Add character", 0, 80, 'add_char', 12);
  this.addMenuButton("Remove character", 0, 100, 'remove_char', 12);
}

Menu.prototype.addMenuButton = function(text, x, y, menuCmd, size){
  var fSize = size.toString() + "px";
  var button = new PIXI.Text(text, new PIXI.TextStyle({ fontFamily: "Arial", fontSize: fSize, fill: "#FFFFFF"}));
  button.position.x = x;
  button.position.y = y;
  button.interactive = true;
  button.buttonMode = true;
  button.fontSize = fSize;

  button.hitArea = new PIXI.Rectangle(0, 0, x+button.width, y+button.height);
  button.on('mousedown', function(data){
    mousedown(data, button);
  });
  button.on('touchstart', function(data){
    mousedown(data, button);
  });
  button.on('mouseover', function(data){
    button.style = new PIXI.TextStyle({ fontFamily: "Arial", fontSize: fSize, fill: "#FFFF00" });
  });
  button.on('mouseup', function(data){
    mouseup(data, button, this.parent, menuCmd);
  });
  button.on('touchend', function(data){
    mouseup(data, button, menuCmd);
  });
  button.on('mouseupoutside', function(data){
    mouseup_outside(data, button);
  });
  button.on('touchendoutside', function(data){
    mouseup_outside(data, button);
  });
  button.on('mouseout', function(data){
    button.style = new PIXI.TextStyle({ fontFamily: "Arial", fontSize: fSize, fill: "#FFFFFF" });
  });
  this.addChild(button);

  return button.width;
}

function mousedown(data, button) {
    button.style = new PIXI.TextStyle({ fontSize: button.fontSize, fill: "#FF0000" });
}

function mouseup(data, button, parentPtr, menuCmd) {
    parentPtr.parent.emit("side_menu_event", menuCmd);
    button.style = new PIXI.TextStyle({ fontSize: button.fontSize, fill: "#FFFFFF" });
}

function mouseup_outside(data, button) {
  button.style = new PIXI.TextStyle({ fontSize: button.fontSize, fill: "#FFFFFF" });
}