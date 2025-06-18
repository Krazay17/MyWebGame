import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class DarkOrbProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, weapon, pointer) {
        super(scene, x, y, 'darkorb', player, 1)
        this.destroyOnHit = false;

        this.pointer = pointer;

        this.name = 'orb'


        if (!scene.anims.get('darkorb')) {
            scene.anims.create({
                key: 'darkorb',
                frames: scene.anims.generateFrameNumbers('darkorb', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1,
            })
        }

        this.activate();
    }

    activate(x, y) {
        if (x || y) {
            this.setPosition(x, y);
        }

        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.damageTick = this.scene.time.addEvent({
            delay: 80,
            callback: () => {
                this.hitTargets = [];
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

        this.play('darkorb');
    }

    deactivate() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
        this.stop();
        this.scene.time.removeEvent(this.damageTick);
        this.hitTargets = [];
        this.detonated = false;
        this.detonateTime = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.setScale(this.scale + .002);
        if (this.detonate) {
            this.setVelocity(0, 0);
            this.setScale(this.scale + 0.005);

            // Initialize if not set, then check time
            const detonateTime = (this.detonateTime ??= time + 500);

            if (time > detonateTime) {
                this.deactivate();
            }
        } else {
            const cursorPos = this.pointer.positionToCamera(this.scene.cameras.main);
            const direction = new Phaser.Math.Vector2(cursorPos.x - this.x, cursorPos.y - this.y).normalize();
            const speed = direction.scale(200);
            this.setVelocity(speed.x, speed.y);
        }
    }


    // destroy() {
    //     this.scene?.time.removeEvent(this.damageTick);
    //     super.destroy();
    // }
}