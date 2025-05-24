
export default class WeaponBase {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.cooldown = false;
        this.cooldownDelay = 200;
    }

    canFire() {
        return !this.cooldown;
    }

    startCooldown() {
        this.cooldown = true;
        this.scene.time.delayedCall(this.cooldownDelay, () => {
            this.cooldown = false;
        });
    }

    fire(pointer) {

    }
}