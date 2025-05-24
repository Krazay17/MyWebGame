export default class Breakable extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture = 'boxsheet', health)
    {
        super(scene, x, y, texture)
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.baseHealth = health;

        if (!scene.anims.get('box'))
            scene.anims.create({
                key: 'box',
                frames: scene.anims.generateFrameNumbers('boxsheet', {start: 0, end: 3}),
                frameRate: 6,
                repeat: -1,
                yoyo: true,
        })
        if (scene.sound.get('energysound'))
            scene.sound.add('energysound');

        this.play('box');
    }

    Hit(player, damage)
    {
        console.log('hitbox')
        this.scene.sound.play('energysound');
    }
}