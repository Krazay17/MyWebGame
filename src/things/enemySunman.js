import BaseEnemy from "./_baseEnemy.js";

export default class SunMan extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'sunsheet', 3)
        // this.setBounce(1);
        // this.setScale(.4);
        // this.scaleCollision(170, 170);
        // this.setBounce(1);
        // this.setCollideWorldBounds(true);
        // this.setVelocityX(-200);
        // this.body.setMaxSpeed(1400);

        if (!this.scene.anims.get('sunsheet')) {
            this.scene.anims.create({
                key: 'sunsheet',
                frames: this.scene.anims.generateFrameNumbers('sunsheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        };
        this.play('sun');
    }
}