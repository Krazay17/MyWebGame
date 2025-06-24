import BaseGame from "./_basegame";

export default class Level5 extends BaseGame {
    constructor() {
        super('Level5');

    }
    preload() {

        this.load.tilemapTiledJSON('tilemap5', 'assets/tilemap5.json')
    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap5');
        this.setupCollisions();
        this.setupMusic();
    }
}