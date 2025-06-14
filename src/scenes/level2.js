import BaseGame from "./_basegame.js";

export default class level2 extends BaseGame {
    constructor() {
        super('level2')
    }

    preload() {
        super.preload();
        this.load.tilemapTiledJSON('tilemap1', 'assets/tilemap3.json')
    }

    create() {
        this.setupSky();
        this.setupSave();
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer();
        this.setupGroups();
        this.setupTileMap();
        this.setupCollisions();
        this.setupMusic('music0');

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