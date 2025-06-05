export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture)
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    playerHit(player, bullet) {
        if (player.TakeDamage(-500, -150))
            bullet.destroy();
    }
}