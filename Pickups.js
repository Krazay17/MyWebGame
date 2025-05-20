import Pickup from "./Pickup.js";

export default class Pickups extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene)

        this.scene.sound.add('pickup');
    }

    SpawnCoin(x, y)
    {
        const coin = new Pickup(this.scene, x, y, 'coin');
        this.add(coin);
        coin.setBounce(.9);
        coin.setScale(.2);
        this.scene.tweens.add({
            targets: coin,
            angle: 360,
            duration: 500,
            repeat: -1
        })
    }

    Pickup(player, coin)
    {
        player.PickupItem(1);
        coin.destroy();
        console.log('pickedup coin');

        if (this.scene.sound.get('pickup'))
            this.scene.sound.play('pickup');
    }
}