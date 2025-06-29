import BaseGame from "./_basegame";

export default class Level4 extends BaseGame {
    constructor() {
        super('Level4');

    }

    create() {

        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 7104, 30304);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap('tilemap4');
        this.setupCollisions();
        this.setupMusic();

    }
}
