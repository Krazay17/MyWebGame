import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class DarkOrbProjectile extends WeaponProjectile {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'darkorb', player, 1)
        this.play('darkorb');
        this.destroyOnHit = false;

        scene.time.addEvent({
            delay: 200,
            callback: () => this.hitTargets = [],
            repeat: -1,
        })

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.setScale(this.scale + .001);
        if(this.detonate) {
            this.setVelocity(0, 0);
            this.setScale(this.scale + .015);
            if (!this.detonated) {
                this.scene.time.delayedCall(400, () => this.destroy())
            }
        }
    }
}