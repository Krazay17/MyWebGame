import BaseGame from "./_basegame";

export default  class Level4 extends BaseGame {
    constructor() {
    super('level4');

    }

    preload() {
        super.preload();
    this.load.image('redsky0', 'assets/RedSky0.webp');
        this.load.tilemapTiledJSON('tilemap4', 'assets/tilemap4.json')

    }

    create() {
        
    this.setupSky({sky1: 'redsky0'});
    this.setupSave();
    this.setupWorld(0, 0, 6400, 6400);
    this.setupPlayer();
    this.setupGroups();
    this.setupTileMap('tilemap4');
    this.setupCollisions();
    this.setupMusic();
        
    }
}