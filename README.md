# TienTN's Litemap Engine

Based on this project: https://github.com/hardwarelayer/PixiJSTilemap

![2DMap sample](https://github.com/hardwarelayer/my_public_images/blob/main/images/litemap_engine1.png)

I want to build a more "engine like" library on top of that.

So I have started this project.

This engine will be kept as a lite, small, fast engine for tile-based map.

### Features:

* Separated data class

* Multiple containers / layers

* Clear event handling

* Multiple resource sources loading

### Deployment:

This only work with a local http server.


### UI tests:

* Zoom in/out: zoom in and out the map

* Drag: drag the map.

* Select tile: select a tile with it's coordinate shown on the left. Show the tile info on the left.

* Change tile: Change the selected map tile to "village" tile.

* Add character: Add a "man" to the overlay layer in the selected cursor (this won't affect the map layer).

* Remove character: Remove the man in the selected layer (if exists)

### notes:

About event:

* evt_mouse_down event: why we use this?

Most of the time, we use mouse_up for a command, but in select tile, we use mouse_down. Because button up may be used for other events like context menu ... etc. So we do select the tile, first.

