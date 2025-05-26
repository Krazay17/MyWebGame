import BaseGame from "./_basegame.js";

/// <reference path="../types/phaser.d.ts" />

export default class Level3 extends BaseGame {
    constructor() {
        super('Level3')
    }

    preload() {
        super.preload()
    }

    create() {
        this.setupWorld(-1000, -3000, 2000, 6000)
        this.setupSky();
        this.setupGroups();
        this.setupKeybinds();
        this.setupMusic();
        this.setupPlayer();
        this.setupCollisions();
        this.makeClimbingPlatforms();
    }
    
    update(time, delta){
        super.update(time, delta);
    }

    makeClimbingPlatforms() {
        const length = 50;
        for (var i = 0; i < length; i++) {
            const yloc = i * 100;
            const xloc1 = Phaser.Math.between(-1000, 1000);
            const xloc2 = Phaser.Math.between(-1000, 1000);
            const xloc3 = Phaser.Math.between(-1000, 1000);
            const platform1 = this.walkableGroup.create(xloc1, yloc, 'platform');
            const platform2 = this.walkableGroup.create(xloc2, yloc, 'platform');
            const platform3 = this.walkableGroup.create(xloc3, yloc, 'platform');

        }
    }

    makeLongFloor() {
        const length = 200;
        for (var i = 0; i < length; i++) {

        }
    }
}