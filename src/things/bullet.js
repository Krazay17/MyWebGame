export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture)
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    playerCollide(player) {
        if (player.TakeDamage(-500, -150))
            this.destroy();
    }
}