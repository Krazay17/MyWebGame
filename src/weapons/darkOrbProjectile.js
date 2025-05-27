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
}