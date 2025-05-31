import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class DarkOrbProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, weapon) {
        super(scene, x, y, 'darkorb', player, 1)
        this.play('darkorb');
        this.destroyOnHit = false;

        scene.time.addEvent({
            delay: 250,
            callback: () => this.hitTargets = [],
            repeat: -1,
        });
        
        // Spin tween
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
        });


    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.setScale(this.scale + .001);
        if(this.detonate) {
            this.setVelocity(0, 0);
            this.setScale(this.scale + .015);
            if (!this.detonated) {
                this.scene.time.delayedCall(500, () => this.destroy())
            }
        }
    }
}