export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture)
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        const bounds = this.scene.physics.world.bounds;

        if (this.x > bounds.x + bounds.width) {
            this.x = bounds.x - this.width;
        }
        if (this.x + this.width < bounds.x) {
            this.x = bounds.x + bounds.width;
        }
        if (this.y > bounds.y + bounds.height) {
            this.y = bounds.y - this.height;
        }
        if (this.y + this.height < bounds.y) {
            this.y = bounds.y + bounds.height;
        }
    }

    playerCollide(player) {
        if (player.TakeDamage(-500, -150))
            this.destroy();
    }
}