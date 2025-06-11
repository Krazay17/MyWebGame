export default class Pickup extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, id = 'coin', pickupSound = 'pickup')
    {
        super(scene, x, y, id)
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.pickupSound = pickupSound;
        scene.sound.add(pickupSound);
    }

    preUpdate()
    {
        const bounds = this.scene.physics.world.bounds;

        // Wrap horizontally
        if (this.x > bounds.x + bounds.width) {
            this.x = bounds.x - this.width;
            this.setVelocity(-20, 20);
        }
        if (this.x + this.width < bounds.x) {
            this.x = bounds.x + bounds.width;
            this.setVelocity(-20, 20);
        }

        // Wrap vertically
        if (this.y > bounds.y + bounds.height) {
            this.y = bounds.y - this.height;
            this.setVelocity(-20, 20);
        }
        if (this.y + this.height < bounds.y) {
            this.y = bounds.y + bounds.height;
            this.setVelocity(-20, 20);
        }
    }


    playerCollide(pickup, player) {
        player.updateMoney(5);
        this.playPickupSound();
        this.emit('pickup');
        this.destroy();
    }

    playPickupSound() {
        if (this.pickupSound && this.scene.sound.get('pickup'))
            this.scene.sound.play('pickup');
    }

    hit(player, damage, velocity) {
        const smallerVelocity = velocity.clone().scale(.2);
        this.setVelocity(smallerVelocity.x, smallerVelocity.y);
    }
}