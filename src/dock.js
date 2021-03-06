import Vector from 'victor';
import keyMirror from 'keyMirror';
import ArrayHelper from './helpers/arrayHelper';

import Assets from './assets';
import GameState from './gameState';
import Grid from './grid';

export default class Dock {
	constructor(stage){
		this.colors = Assets.get('color', false).colors;
		this.tileTypes = ArrayHelper.rotate([this.extractTileTypes(Assets.get("world"))]);
		this.grid = [];
		this.stage = stage;

		this.drawContainer = this.createDrawContainer(stage);
		this.drawContainer.addEventListener("click", this.onDockClick.bind(this));
	}

	static get Events() {
		return keyMirror({
			TOWER_SELECTED: null
		});
	}

	get tileSize(){ return 60; } //TODO: Make this a settting 
	get padding(){ return 20; }

	init(){
		this.grid = new Grid(
			this.tileTypes.length, 
			this.tileTypes[0].length,
			this.tileSize, 
			this.tileJudger.bind(this));

		this.stage.addChild(this.drawContainer);
	}

	/**
	 * Search through the different tile types for the ones who can attack
	 * @param  {json} worldSettings World JSON settings
	 * @return {object[]}               List of the attacking tile types
	 */
	extractTileTypes(worldSettings) {
		let types = [];
		for (var prop in worldSettings.tileTypes) {
			if(worldSettings.tileTypes.hasOwnProperty(prop)){
				if(worldSettings.tileTypes[prop].attacks){
					types.push({name: prop, settings: worldSettings.tileTypes[prop]});	
				}
			}
		}
		return types;
	}

	/**
	 * Create a container for the docker graphics
	 * @param  {createjs.Stage} stage Game main stage
	 * @return {createjs.Container}       
	 */
	createDrawContainer(stage) {
		let container = new createjs.Container();
		container.y = stage.canvas.height - this.tileSize - (this.padding * 2);

		let background = new createjs.Shape();
		background.graphics
			.setStrokeStyle(2).beginStroke(this.colors["dockBorder"])
			.beginFill(this.colors["dock"])
			.drawRect(0, 0, stage.canvas.width, this.tileSize + (this.padding * 2));

 		container.addChild(background);
		return container;
	}

	/**
	 * Decides and create the tile
	 * @param  {int} gridX X in grid array
	 * @param  {int} gridY Y in grid array
	 * @return {Tile}      
	 */
	tileJudger(gridX, gridY){
		let tilePos = new Vector(gridX * this.tileSize + this.padding, this.padding),
			tileType = this.tileTypes[gridX][gridY],
			text = new createjs.Text(tileType.name, "20px Arial", "#D1D1BC"),
			shape = new createjs.Shape();
 		
 		shape.graphics
 			.setStrokeStyle(1).beginStroke("#fff")
 			.beginFill("#466964")
 			.drawRect(tilePos.x, tilePos.y, this.tileSize, this.tileSize);

		text.x = tilePos.x + (this.tileSize / 2) - (text.getMeasuredWidth() / 2);
		text.y = tilePos.y + (this.tileSize / 2) + (text.getMeasuredHeight() / 2);	
		text.textBaseline = "alphabetic";

 		this.drawContainer.addChild(shape);
 		this.drawContainer.addChild(text);
 		return tileType;
	}

	onDockClick(click){
		let gridPos = this.grid.getArrayPos(this.drawContainer.globalToLocal(click.stageX, click.stageY), this.padding);

		if(gridPos && GameState.canPlaceNewTower) {
			GameState.raiseEvent(Dock.Events.TOWER_SELECTED, this.tileTypes[gridPos.x][gridPos.y].name);
		}
	}
}