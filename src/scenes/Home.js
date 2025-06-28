import BaseGame from './_basegame.js'
import Breakable from '../things/Breakable.js';
import GameManager from '../things/GameManager.js';
import ScoreBoard from '../things/scoreBoard.js';

export default class Home extends BaseGame {
    constructor() {
        super('Home');
    }

    create() {
        this.setupSky();
        this.setupWorld(0, 0, 6400, 6400);
        this.setupPlayer(3200, 3150);
        this.setupGroups();
        this.setupTileMap('tilemapHome');
        this.setupCollisions();
        this.setupMusic('music1');

        // const boxPos = [[-200, 200], [-500, 400], [-400, 200], [-200, 400], [100, 450], [400, 400], [200, 300]];
        // boxPos.forEach(pos => this.walkableGroup.add(new Breakable(this, pos[0], pos[1], 'boxsheet', 2)));


        // const widePlatformPos = [
        //     [-1200, 350], [-800, 500], [-400, 650], [0, 800], [400, 650], [800, 500], [1200, 350], [400, 1000], [-400, 1000], [-700, 1200], [700, 1200],
        // ];
        // widePlatformPos.forEach(pos => {
        //     const plat = this.walkableGroup.create(pos[0], pos[1], 'platformwide');
        //     plat.refreshBody();
        // });

        // const largePlatform = this.walkableGroup.create(0, 1450, 'largeplatform').setScale(5, 1.5);
        // largePlatform.refreshBody();

        this.setupPortals();

        this.network.socket.emit('highScoreRequest');
    }

    update(time, delta) {
        super.update(time, delta);
    }

    setupPortals() {

        this.portals = this.physics.add.staticGroup();

        const portal0 = this.portals.create(800, 400, 'portal0');
        const portal02 = this.add.image(800, 400, 'portal0');
        portal02.flipX = true;

        //const portal1 = this.portals.create(2300, 2930, 'portal1');
        const portal2 = this.portals.create(3860, 2430, 'door0').setScale(.25);

        if (!this.anims.get('portal3')) {
            this.anims.create({
                key: 'portal3',
                frameRate: 6,
                frames: this.anims.generateFrameNumbers('portal3', { start: 0, end: 5 }),
                repeat: -1,
            });
        }

        const portal1 = this.portals.create(3200, 2650, 'portal3').setScale(.2).play('portal3').setTint(0xFF0000)
        const portal3 = this.portals.create(3350, 2100, 'portal3').setScale(.2).play('portal3').setTint(0x00FF00);
        const portal5 = this.portals.create(2050, 2050, 'portal3').setScale(.2).play('portal3').setTint(0x00FFFF);
        const portal6 = this.portals.create(1070, 1860, 'portal3').setScale(.2).play('portal3').setTint(0x0000FF);
        const portal7 = this.portals.create(4084, 3260, 'portal3').setScale(.2).play('portal3');
        
        this.shrinkCollision(portal0, 140, 140);
        this.shrinkCollision(portal1, 140, 140);
        this.shrinkCollision(portal2, 140, 140);
        this.shrinkCollision(portal3, 140, 140);
        this.shrinkCollision(portal5, 140, 140);
        this.shrinkCollision(portal6, 140, 140);
        this.shrinkCollision(portal7, 140, 140);

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

        portal0.targetScene = 'Level1';
        portal2.targetScene = 'Level2';
        portal1.targetScene = 'Level3';
        portal3.targetScene = 'Level4';
        portal5.targetScene = 'Level5';
        portal6.targetScene = 'Level6';
        portal7.targetScene = 'Level7';

        this.physics.add.overlap(this.player, this.portals, (player, portal) => {
            if (portal.targetScene && this.scene.key !== portal.targetScene) {
                GameManager.useLastLocation = false;
                GameManager.save();
                console.log(portal.targetScene)
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
                    x = 3860;
                    y = 2430;
                    break;
                case 'Level4':
                    x = 3350;
                    y = 2100;
                    break;
                case 'Level5':
                    x = 2050;
                    y = 2050;
                    break;
                case 'Level6':
                    x = 1070;
                    y = 1860;
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