export default class Pickup extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, id = 'coin')
    {
        super(scene, x, y, id)

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    preUpdate()
    {
        if (this.y > this.scene.physics.world.bounds.height){
        this.y = 0 - this.height;
        this.setVelocityY(0);
        }
    }
}