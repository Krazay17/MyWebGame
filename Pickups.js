export default class Pickups extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene)
    }

    SpawnCoin(x, y)
    {
        const coin = this.create(x, y, 'coin');
        coin.setBounce(1);
    }

    Pickup(player, coin)
    {
        coin.destroy();
    }
}