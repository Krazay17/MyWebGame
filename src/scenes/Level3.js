import BaseGame from "./_basegame.js";

/// <reference path="../types/phaser.d.ts" />

export default class Level3 extends BaseGame {
    constructor() {
        super('Level3')
    }

    preload() {
        super.preload()
        this.load.audio ('farted', 'assets/Farted4.wav');
        this.load.image ('bat', 'assets/BatEnemy.png')
    }

    create() {
        this.setupWorld(-1200, 0, 2400, 6000)
        this.setupSave();
        this.setupSky();
        this.setupGroups();
        this.setupKeybinds();
        this.setupMusic('farted', .4);
        this.setupPlayer(0, 5500);
        this.setupCollisions();
        this.makeClimbingPlatforms();

        this.walkableGroup.create(0, 5600, 'platform');

        this.enemyTimer();
    }
    
    update(time, delta){
        super.update(time, delta);
    }

    makeClimbingPlatforms() {
        const length = 50;
        for (var i = 0; i < length; i++) {
            const yloc = i * 125;
            const xloc1 = Phaser.Math.Between(-1000, -250);
            const xloc2 = Phaser.Math.Between(-250, 250);
            const xloc3 = Phaser.Math.Between(250, 1000);
            // const xloc4 = Phaser.Math.Between(-1000, 1000);
            const platform1 = this.walkableGroup.create(xloc1, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform2 = this.walkableGroup.create(xloc2, yloc + Phaser.Math.Between(-20, 20), 'platform');
            const platform3 = this.walkableGroup.create(xloc3, yloc + Phaser.Math.Between(-20, 20), 'platform');
            // const platform4 = this.walkableGroup.create(xloc4, yloc + Phaser.Math.Between(-20, 20), 'platform');

        }
    }

    makeLongFloor() {
        const length = 200;
        for (var i = 0; i < length; i++) {

        }
    }

    enemyTimer() {
        this.time.addEvent({
            delay: this.spawnSpeed = 500,
            callback: () => this.spawnEnemies(),
            loop: true
        })
    }

    spawnEnemies() {
        const { x, y, spawnLeft } = this.getSpawnPos();
        const bat = this.spawnManager.spawnBat(x, y);
        bat.setVelocityX(spawnLeft? 100 : -100);
        bat.flipX = spawnLeft;
    }

    getSpawnPos() {
        const left = this.bounds.left;
        const right = this.bounds.right;

        const spawnLeft = Phaser.Math.Between(0, 1) === 0;

        const x = spawnLeft
        ? left - Phaser.Math.Between(50, 150)
        : right + Phaser.Math.Between(50, 150);

        const y = this.player.y + Phaser.Math.Between(-150, 150)

        return {x, y, spawnLeft};
    }
}