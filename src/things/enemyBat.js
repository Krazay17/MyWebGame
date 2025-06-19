import BaseEnemy from "./_baseEnemy.js";

export default class Bat extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'bat')
        this.player = this.scene.player;

        this.name = 'bat';
        this.maxHealth = 2;
        this.health = 2;
        this.flying = true;

    }

    init() {
        if (!this.isRemote) {
        this.accelToPlayer(100, 600);
        }
        this.scaleCollision(30, 30)
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        super.replicateEnemy();
        if(this.body.velocity.length() < 50) {
            this.setVelocity(Phaser.Math.Between(-400, 400), Phaser.Math.Between(-400, 400));
        }
        }

}
