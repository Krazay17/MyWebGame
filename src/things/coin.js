import Pickup from "./Pickup.js";

export default class Coin extends Pickup {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
    }

    playerCollide(player) {
        
        player.updateMoney(5);
        this.playPickupSound();
        this.emit('pickup');
        this.destroy();
    }
}