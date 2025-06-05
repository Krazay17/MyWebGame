import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class DarkOrbProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, weapon, pointer) {
        super(scene, x, y, 'darkorb', player, 1)
        this.play('darkorb');
        this.destroyOnHit = false;

        this.pointer = pointer;

        this.baseTickDelay = 200;
        this.damageTick = scene.time.addEvent({
            delay: this.baseTickDelay,
            callback: () => {
                this.hitTargets = [];
                this.damageTick.delay = Phaser.Math.Clamp(this.baseTickDelay -= 5, 80, 200);
                console.log(this.baseTickDelay)

            },
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
        this.setScale(this.scale + .002);
        if(this.detonate) {
            this.setVelocity(0, 0);
            this.setScale(this.scale + .015);
            if (!this.detonated) {
                this.detonated = true;
                this.scene.time.delayedCall(400, () => this.destroy())
            }
        } else {
        const cursorPos = this.pointer.positionToCamera(this.scene.cameras.main);
        const direction = new Phaser.Math.Vector2(cursorPos.x - this.x, cursorPos.y - this.y).normalize();
        const speed = direction.scale(200);
            this.setVelocity(speed.x, speed.y);
        }
    }

    destroy() {
        this.scene.time.removeEvent(this.damageTick);
        super.destroy();
    }
}