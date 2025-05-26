import BaseGame from './_basegame.js'
import Breakable from '../Things/Breakable.js';

export default class Home extends BaseGame {
    constructor() {
        super('Home');
    }

    preload() {
        super.preload();
        this.load.image('platformwide', 'Assets/platformwide.png')
        this.load.image('portal0', 'Assets/Portal1.png')
        this.load.image('portal1', 'Assets/Portal2.png')
        this.load.image('duck', 'Assets/DuckFloaty.png')
    }

    create() {
        this.saveLevel();
        this.setupKeybinds();
        this.setupSky();
        this.setupWorld();
        this.setupMusic('homemusic');
        this.setupFPS();
        this.setupPlayer();

        this.setupGroups();

        const boxPos = [[-200, 200], [-500, 500], [-400, 300], [-200, 500], [100, 550], [400, 500], [200, 400]];
        boxPos.forEach(pos => this.staticItemGroup.add(new Breakable(this, pos[0], pos[1], 'boxsheet', 2)));

        this.setupCollisions();

        const widePlatformPos = [
            [-1000, 500], [-800, 600], [-400, 700], [0, 800], [400, 700], [800, 600], [1000, 500]
        ];
        widePlatformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platformwide'));

        this.setupPortals();

        this.spawnEnemies();


    }

    update(time, delta) {
        super.update(time, delta);
    }

    setupPortals() {
        this.portalList = [];

        this.portals = this.physics.add.staticGroup();

        const portal0 = this.portals.create(800, 300, 'portal0');
        const portal12 = this.add.image(800, 300, 'portal0');
        portal12.flipX = true;
        const portal1 = this.portals.create(-800, 300, 'portal1');

        this.shrinkCollision(portal0, 100, 100);
        this.shrinkCollision(portal1, 100, 100);

        const portalsToSpin = [
            { sprite: portal0, angle: -360, duration: 1500 },
            { sprite: portal12, angle: 360, duration: 1200 }
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

        this.portalList.push(portal0, portal1);

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                this.scene.start(portal.targetScene);
            }
        });

    }

    spawnEnemies() {
        this.spawnManager.spawnDuck(300, 300);
        this.spawnManager.SpawnCoin(100, 300);
    }
}