import Pickup from "./Pickup";

export default class DashBuff extends Pickup {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
        this.setScale(.4)
        this.setTint(0x0000FF)

        this.randomShake = this.x + Phaser.Math.Between(-5, 5)
        this.scene.add.tween({
            targets: this,
            duration: 150,
            x: this.randomShake,
            yoyo: true,
            repeat: -1,
            onRepeat: () => this.randomShake = this.x + Phaser.Math.Between(-50, 50)
        })
    }

    playerCollide(player) {
        player.dashBuff();
        this.playPickupSound();
        this.emit('pickup');
        this.destroy();
    }

    hit() {}
}