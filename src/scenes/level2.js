import BaseGame from "./_basegame.js";

export default class level2 extends BaseGame {
    constructor() {
        super('level2')
    }

    preload() {
        super.preload();
        this.load.tilemapTiledJSON('tilemap1', 'assets/tilemap1.json')
        this.load.image('tiles', 'assets/tilesheet.png')
    }

    create() {
        this.setupSky();
        this.setupSave();
        this.setupWorld(0, 0, 5000, 5000);
        this.setupPlayer(400, 500);
        this.setupGroups();
        this.setupMusic();

        const map = this.make.tilemap({ key: 'tilemap1' });
        const tileset = map.addTilesetImage('tiles', 'tiles');
        const layer1 = map.createLayer('layer1', tileset, 0, 0);
        const layer2 = map.createLayer('layer2', tileset, 0, 0);
        const walls = map.createLayer('walls', tileset, 0, 0);

        walls.setCollisionByExclusion([-1]); // excludes only empty tiles
        this.tilemapColliders = [walls];
        this.setupCollisions();

        // const objects = map.getObjectLayer('objects1');
        // objects.objects.forEach(obj => {
        //     const plat = this.physics.add.staticImage(obj.x, obj.y, null);
        //     plat.displayWidth = obj.width;
        //     plat.displayHeight = obj.height;
        //     plat.setOrigin(0); // Important: match Tiled's origin
        //     this.walkableGroup.add(plat);
        // });



        //     this.physics.add.collider(this.player, walls, (player, wall) => {
        //   player.TouchPlatform();

        //     }, null, this);
    }
}