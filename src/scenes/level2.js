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
        this.setupPlayer(1030, 573);
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

        this.setupPortals();

        const objects = map.getObjectLayer('objects1');
        objects.objects.forEach(obj => {
            this[obj.name]?.(obj.x, obj.y);
        });
    }

    spawnDuck(x, y) {
        this.spawnManager.spawnDuck(x, y);
    }

    setupPortals() {
        this.portalList = [];

        this.portals = this.physics.add.staticGroup();

        const portal0 = this.portals.create(5000, 400, 'portal0');
        const portal1 = this.portals.create(5000, 2000, 'portal1');
        const portal2 = this.portals.create(400, 573, 'door0').setScale(.2);

        this.shrinkCollision(portal0, 150, 150);
        this.shrinkCollision(portal1, 150, 150);
        this.shrinkCollision(portal2, 60, 60);

        const portalsToSpin = [
            { sprite: portal0, angle: -360, duration: 1500 }
        ];
        portalsToSpin.forEach(({ sprite, angle, duration }) => {
            this.tweens.add({
                targets: sprite,
                angle: angle,
                duration: duration,
                repeat: -1,
            });
        });

        this.tweens.add({
            targets: portal1,
            scaleX: 1,
            scaleY: 1,
            ease: 'Sine.easeInOut',
            duration: 500,
            yoyo: false,
            repeat: -1,
            onRepeat: (tween) => {
                const newScale = Phaser.Math.FloatBetween(0.3, .5);
                tween.updateTo('scaleX', newScale, true);
                tween.updateTo('scaleY', newScale, true);
            }
        });


        portal0.targetScene = 'Level1';
        portal1.targetScene = 'Level3';
        portal2.targetScene = 'Home';

        this.portalList.push(portal0, portal1);

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                this.scene.start(portal.targetScene);
            }
        });

    }
}