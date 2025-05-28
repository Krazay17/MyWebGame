import BaseEnemy from "./_baseEnemy.js";

export default class Bat extends BaseEnemy {
    constructor(scene, x, y, id = 'bat') {
        super(scene, x, y, id)
        this.player = this.scene.player;

        this.maxHealth = 2;
        this.health = 2;
        this.body.allowGravity = false;
        this.flying = true;

        this.scene.time.delayedCall(500, this.randomizeAccel, this)
    }

    preUpdate() {
        super.preUpdate();
        if (!this.player) return;
        this.scene.physics.accelerateToObject(this, this.player, this.flyAccell, 300, 300);
    }

    randomizeAccel() {
        this.flyAccell = Phaser.Math.Between(100, 500);
    }
}