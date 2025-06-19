import BaseEnemy from "./_baseEnemy.js";

export default class SunMan extends BaseEnemy {
    constructor(scene, x, y, health = 3) {
        super(scene, x, y, 'sunsheet', health)

        this.setScale(.4);

        this.name = 'sunMan';
        this.maxaccell = 400;
        this.damage = 4;

        if (!scene.anims.get('sunsheet')) {
            scene.anims.create({
                key: 'sunsheet',
                frames: scene.anims.generateFrameNumbers('sunsheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        };
        this.play('sunsheet')
    }

    init() {
        if (!this.isRemote) {
            this.accelToPlayer(200, 400);
        }
        this.body.setMaxSpeed(1000);
        this.setBounce(1);
        this.scaleCollision(170, 170);
        this.setCollideWorldBounds(true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.replicateEnemy();
    }
}