import BaseGame from "./_basegame";

export default class Level6 extends BaseGame {
    constructor() {
        super('Level6');

    }

    create() {
        this.setupSky({ sky1: 'redsky0' });
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer(100, 260);
        this.setupGroups();
        this.setupTileMap('tilemap6');
        this.setupCollisions();
        this.setupMusic();
    }
}
