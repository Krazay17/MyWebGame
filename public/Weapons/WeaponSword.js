import WeaponBase from './_weaponbase.js';

export default class WeaponSword extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 3)

        this.cooldownDelay = 1000;
        this.meleeDuration = 600;
    }

    update(delta) {
        super.update(delta);
        if (this.sword) {
            this.sword.x = this.player.x + this.swordOffset.x;
            this.sword.y = this.player.y - 15 + this.swordOffset.y;
        }
    }

    fire(pointer) {
        if (this.sword) return;
        if (!this.canFire()) return;
        this.clearHits();
        this.startCooldown();
        this.playThrowSound();

        const data = this.calculateShot(pointer, 65);
        const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(data.start.x, data.start.y, data.cursorPos.x, data.cursorPos.y));

        this.swordOffset = data.vector;

        this.sword = this.scene.add.image(data.start.x + data.vector.x, data.start.y + data.vector.y, 'sword').setScale(0.3).setAngle(angleDeg);
        console.log(data.vector.x);

        const rayData = this.calculateShot(pointer, 120);
        this.fireRayAttack(rayData);

        this.rayTickData = {...rayData};
        this.meleeRayTick = true;

        // Cleanup
        this.scene.time.delayedCall(this.meleeDuration, () => {
            this.meleeRayTick = false;
            this.sword.destroy();
            delete this.sword;
        });
    }
}
