export default class PlayerWeapons extends Phaser.Physics.Arcade.Group
{
    constructor (scene, player)
    {
        super(scene.physics.world, scene, {allowGravity: false});
        this.player = player;
    }
}