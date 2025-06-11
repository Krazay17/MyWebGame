import BaseGame from "./_basegame.js";

/// <reference path="../types/phaser.d.ts" />

// Tower climb level

export default class Level3 extends BaseGame {
    constructor() {
        super('Level3')
    }

    preload() {
        super.preload()
        this.load.audio('music2', 'assets/music2.mp3');
        this.load.tilemapTiledJSON('tilemap2', 'assets/tilemap2.json')
        this.load.image('bat', 'assets/BatEnemy.png')
        this.load.spritesheet('sunsheet', 'assets/SunSheet.png', {
            frameHeight: 256,
            frameWidth: 256
        })
    }

    create() {
        this.setupSave();
        this.setupSky({sky2: false, sky3: false});
        this.sky2 = this.add.image(1000, 900, 'purplesky1').setScale(1.1).setScrollFactor(.15);
        this.sky3 = this.add.image(1200, 600, 'skybluestreaks').setScale(.8).setScrollFactor(.3);
        this.setupWorld(0, 0, 6400, 6400)
        this.setupGroups();
        this.setupPlayer(3200, 6200);
        this.setupTileMap('tilemap2');
        this.setupCollisions();
        this.setupMusic('music2');

        //this.sunManHealth = 3;

        this.spawnSpeed = 2500;
        this.enemyTimers();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    makeClimbingPlatforms() {
        const length = 45;
        for (let i = 4; i < length; i++) {
            const yloc = i * 125;
            const xloc1 = Phaser.Math.Between(-1000, -250);
            const xloc2 = Phaser.Math.Between(-250, 250);
            const xloc3 = Phaser.Math.Between(250, 1000);
            const platform1 = this.walkableGroup.create(xloc1, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform2 = this.walkableGroup.create(xloc2, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform3 = this.walkableGroup.create(xloc3, yloc + Phaser.Math.Between(-20, 20), 'platform');

        }
    }

    checkPlayerY() {
        if (!this.player) return;
        const y = this.player.y;

        if (y > 5500) {
            this.batTimer.delay = 2000;
            this.doSpawnSunMans = false;
            return;
        }
        if (y > 4000) {
            this.batTimer.delay = 1500;
            this.doSpawnSunMans = true;
            this.sunManHealth = 5;
            this.sunTimer.delay = 6000;
            return;
        }
        if (y > 3000) {
            this.batTimer.delay = 1000;
            this.doSpawnSunMans = true;
            this.sunManHealth = 10;
            this.sunTimer.delay = 5500;
            return;
        }
        if (y > 2000) {
            this.batTimer.delay = 500;
            this.doSpawnSunMans = true;
            this.sunManHealth = 15;
            this.sunTimer.delay = 5000;
            return;
        }
        if (y > 1000) {
            this.batTimer.delay = 250;
            this.doSpawnSunMans = true;
            this.sunManHealth = 25;
            this.sunTimer.delay = 4500;
            return;
        }
        if (y > 0) {
            this.batTimer.delay = 100;
            this.doSpawnSunMans = true;
            this.sunManHealth = 50;
            this.sunTimer.delay = 2000;
            return;
        }
    }

    enemyTimers() {
        this.batTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                const { x, y } = this.getSpawnPos();
                const bat = this.spawnManager.spawnBat(x, y);

                this.checkPlayerY();
            },
            loop: true
        });

        this.sunTimer = this.time.addEvent({
            delay: 6000,
            callback: () => {
                if(!this.doSpawnSunMans) return;
                const { x, y } = this.getSpawnPos();
                const sunMan = this.spawnManager.spawnSunMans(x, y, this.sunManHealth);
                
                this.checkPlayerY();
            },
            loop: true
        });

        //this.time.delayedCall(5000, () => this.sunMan());
    }

    getSpawnPos() {
        const left = this.bounds.left;
        const right = this.bounds.right;

        const spawnLeft = Phaser.Math.Between(0, 1) === 0;

        const x = spawnLeft
            ? left + Phaser.Math.Between(150, 500)
            : right - Phaser.Math.Between(150, 500);

        const y = this.player.y + Phaser.Math.Between(-650, -850)

        return { x, y, spawnLeft };
    }

    sunMan() {
        const { x, y } = this.getSpawnPos();
        const sunMan = this.spawnManager.spawnSunMans(x, y, this.sunManHealth);
        // sunMan.once('die', () => {
        //     this.time.delayedCall(5000, () => this.sunMan())
        // })

    }
}