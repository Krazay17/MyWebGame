import BaseGame from './_basegame.js'
import Breakable from '../things/Breakable.js';

export default class Home extends BaseGame {
    constructor() {
        super('Home');
    }

    preload() {
        super.preload();
        this.load.image('platformwide', 'assets/platformwide.png');
        this.load.image('portal0', 'assets/Portal1.png');
        this.load.image('portal1', 'assets/Portal2.png');
        this.load.image('largeplatform', 'assets/LargePlatform.webp');
    }

    create() {
        this.setupSave();
        this.setupSky();
        this.setupWorld(-2000, 0, 4000, 2000);
        this.setupPlayer(0, 740);
        this.setupMusic('music1');

        this.setupGroups();

        const boxPos = [[-200, 200], [-500, 400], [-400, 200], [-200, 400], [100, 450], [400, 400], [200, 300]];
        boxPos.forEach(pos => this.staticItemGroup.add(new Breakable(this, pos[0], pos[1], 'boxsheet', 2)));

        this.setupCollisions();

        const widePlatformPos = [
            [-1200, 350], [-800, 500], [-400, 650], [0, 800], [400, 650], [800, 500], [1200, 350], [400, 1000],[-400, 1000],[-700, 1200],[700, 1200],
        ];
        widePlatformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platformwide'));

        const largePlatform = this.walkableGroup.create(0, 1450, 'largeplatform').setScale(5, 1.5);

        this.setupPortals();

        this.spawnEnemies();


    }

    update(time, delta) {
        super.update(time, delta);
    }

    setupPortals() {
        this.portalList = [];

        this.portals = this.physics.add.staticGroup();

        const portal0 = this.portals.create(800, 400, 'portal0');
        const portal02 = this.add.image(800, 400, 'portal0');
        portal02.flipX = true;
        const portal1 = this.portals.create(-800, 400, 'portal1');
        const portal2 = this.portals.create(-600, 900, 'door0').setScale(.3);

        this.shrinkCollision(portal0, 150, 150);
        this.shrinkCollision(portal1, 150, 150);
        this.shrinkCollision(portal2, 150, 150);

        const portalsToSpin = [
            { sprite: portal0, angle: -360, duration: 1500 },
            { sprite: portal02, angle: 360, duration: 1200 }
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
        portal2.targetScene = 'level2';

        this.portalList.push(portal0, portal1);

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                this.scene.start(portal.targetScene);
            }
        });

    }

    spawnEnemies() {
        this.spawnManager.spawnDuck(400, 1000, 50);
        this.spawnManager.SpawnCoin(100, 300);
    }
}