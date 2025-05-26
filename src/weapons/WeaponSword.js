import WeaponBase from './_weaponbase.js';

export default class WeaponSword extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 3)

        this.baseCooldown = 500;
        this.meleeDuration = 360;
        this.spamAdd = 100;
        this.hitSound = 'energysound';

        if (!scene.anims.get('swordsheet')) {
            scene.anims.create({
                key: 'swordsheet',
                defaultTextureKey: 'swordsheet',
                duration: 360,
                frames: [
                    { frame: 0 },
                    { frame: 1 },
                    { frame: 2 },
                    { frame: 2 },
                    { frame: 3 },
                    { frame: 3 },
                    { frame: 3 },
                    { frame: 3 },
                    { frame: 4 },
                    { frame: 5 },
                ],
            })
        }
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

        const data = this.calculateShot(pointer, 60);
        const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(data.start.x, data.start.y, data.cursorPos.x, data.cursorPos.y));

        this.swordOffset = data.vector;

        this.sword = this.scene.add.sprite(data.start.x + data.vector.x, data.start.y + data.vector.y, 'swordsheet').setScale(0.25).setAngle(angleDeg);
        this.sword.play('swordsheet');

        const rayData = this.calculateShot(pointer, 115);
        this.fireRayAttack(rayData);

        this.rayTickData = { ...rayData };
        this.meleeRayTick = true;

        // Cleanup
        this.scene.time.delayedCall(this.meleeDuration, () => {
            this.meleeRayTick = false;
            this.sword.destroy();
            delete this.sword;
        });
    }
}
