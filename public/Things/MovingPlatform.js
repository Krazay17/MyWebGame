export default class MovingPlatform extends Phaser.Physics.Arcade.StaticGroup
{
    constructor(scene, x, y, id = 'movingPlatform')
    {
        super(scene.physics.world, scene);

        const platform = scene.create()
    }
}