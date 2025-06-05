import BaseEnemy from "./_baseEnemy.js";

export default class Bat extends BaseEnemy {
    constructor(scene, x, y, id = 'bat') {
        super(scene, x, y, id)
        this.player = this.scene.player;

        this.maxHealth = 2;
        this.health = 2;
        this.flying = true;

        this.accelToPlayer(100, 600);

        this.scaleCollision(30, 30)
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if(this.body.velocity.length() < 50) {
            this.setVelocity(Phaser.Math.Between(-400, 400), 400);
        }
        }
}
