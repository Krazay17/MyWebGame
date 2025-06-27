import BaseGame from './_basegame.js'
import Breakable from '../things/Breakable.js';
import GameManager from '../things/GameManager.js';
import ScoreBoard from '../things/scoreBoard.js';

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
        this.load.spritesheet('portal3', 'assets/greenPortal.png', {
            frameWidth: 1024,
            frameHeight: 1024,
        })
    }

    create() {
        this.setupSky();
        this.setupWorld(-2000, 0, 4000, 2000);
        this.setupPlayer(0, 740);
        this.setupMusic('music1');

        this.setupGroups();
        this.setupCollisions();

        const boxPos = [[-200, 200], [-500, 400], [-400, 200], [-200, 400], [100, 450], [400, 400], [200, 300]];
        boxPos.forEach(pos => this.walkableGroup.add(new Breakable(this, pos[0], pos[1], 'boxsheet', 2)));


        const widePlatformPos = [
            [-1200, 350], [-800, 500], [-400, 650], [0, 800], [400, 650], [800, 500], [1200, 350], [400, 1000], [-400, 1000], [-700, 1200], [700, 1200],
        ];
        widePlatformPos.forEach(pos => {
            const plat = this.walkableGroup.create(pos[0], pos[1], 'platformwide');
            plat.refreshBody();
        });

        const largePlatform = this.walkableGroup.create(0, 1450, 'largeplatform').setScale(5, 1.5);
        largePlatform.refreshBody();
        this.setupPortals();

        this.time.delayedCall(500, ()=> {
            this.network.socket.emit('highScoreRequest')
        });
    }

    update(time, delta) {
        super.update(time, delta);
    }

    setupPortals() {

        this.portals = this.physics.add.staticGroup();

        const portal0 = this.portals.create(800, 400, 'portal0');
        const portal02 = this.add.image(800, 400, 'portal0');
        portal02.flipX = true;
        const portal1 = this.portals.create(-800, 400, 'portal1');
        const portal2 = this.portals.create(-700, 800, 'door0').setScale(.3);

        if (!this.anims.get('portal3')) {
            this.anims.create({
                key: 'portal3',
                frameRate: 6,
                frames: this.anims.generateFrameNumbers('portal3', { start: 0, end: 5 }),
                repeat: -1,
            });
        }

        const portal3 = this.portals.create(700, 800, 'portal3').setScale(.2).play('portal3').setTint(0x00FF00);
        const portal5 = this.portals.create(300, 1100, 'portal3').setScale(.2).play('portal3').setTint(0x0000FF);

        this.shrinkCollision(portal0, 150, 150);
        this.shrinkCollision(portal1, 150, 150);
        this.shrinkCollision(portal2, 150, 150);
        this.shrinkCollision(portal3, 150, 150);
        this.shrinkCollision(portal5, 150, 150);

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
        portal2.targetScene = 'Level2';
        portal1.targetScene = 'Level3';
        portal3.targetScene = 'Level4';
        portal5.targetScene = 'Level5';

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                GameManager.useLastLocation = false;
                GameManager.save();
                this.scene.start(portal.targetScene);
            }
        });

    }

updateScoreBoard(data) {
    if (!this.scoreBoard) this.scoreBoard = {};

    let x = 0;
    let y = 0;

    data.forEach(obj => {
        switch (obj.level) {
            case 'Level2':
                x = -700;
                y = 800;
                break;
            case 'Level4':
                x = 700;
                y = 800;
                break;
            case 'Level5':
                x = 300;
                y = 1100;
                break;
        }

        // 🔥 Always destroy and recreate
        if (this.scoreBoard[obj.level]) {
            this.scoreBoard[obj.level].destroy();  // removes all children too
        }

        const board = new ScoreBoard(this, x + 100, y - 125, obj.scores);
        this.add.existing(board);
        this.scoreBoard[obj.level] = board;
    });
}

}