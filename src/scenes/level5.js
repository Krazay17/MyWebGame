import BaseGame from "./_basegame";

export default  class Level5 extends BaseGame {
    constructor() {
    super('Level5');

    }
    preload() {
        
        this.load.tilemapTiledJSON('tilemap4', 'assets/tilemap4.json')
    }

    create() {
        this.setupTilemap()
    }
}