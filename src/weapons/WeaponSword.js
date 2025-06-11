import GameManager from '../things/GameManager.js';
import WeaponBase from './_weaponbase.js';
import SwordWave from './swordWave.js';

export default class WeaponSword extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 5)

        this.name = 'sword'
        this.baseCooldown = 300;
        this.meleeDuration = 300;
        this.spamAdd = 100;
        this.hitSoundId = 'energysound';

        if (!scene.anims.get('sword')) {
            scene.anims.create({
                key: 'sword',
                defaultTextureKey: 'sword',
                duration: 300,
                frames: [
                    { frame: 0 },
                    { frame: 1 },
                    { frame: 2 },
                    { frame: 2 },
                    { frame: 3 },
                    { frame: 4 },
                    { frame: 5 },
                ],
            })
        }

        if (!scene.anims.get('swordwave')) {
            scene.anims.create({
                key: 'swordwave',
                defaultTextureKey: 'swordwave',
                duration: 200,
                repeat: -1,
                frames: [
                    { frame: 0 },
                    { frame: 1 },
                ],
            })
        }

        
        this.setStats();
    }

    update(delta) {
        super.update(delta);
        if (this.sword) {

            this.sword.x = this.player.x + this.swordOffset.x;
            this.sword.y = this.player.y - 15 + this.swordOffset.y;
        }
    }

    setStats() {
        if(GameManager.upgrades.swordUpgradeA) {
            this.doesFireWave = true;
        } else {
            this.doesFireWave = false;
        }
    }

    fire(pointer) {
        if (this.sword) return;
        if (!this.canFire()) return;
        this.clearHits();
        this.startCooldown();
        this.playThrowSound();

        const data = this.calculateShot(pointer, 70);
        const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(data.start.x, data.start.y, data.cursorPos.x, data.cursorPos.y));

        this.swordOffset = data.vector;

        this.sword = this.scene.add.sprite(data.start.x + data.vector.x, data.start.y + data.vector.y, 'sword')
            .setScale(0.24)
            .setAngle(angleDeg)
            .setDepth(101);
        this.sword.play('sword');
        this.sword.setFlipY(angleDeg > 90 || angleDeg < -90);

        const rayData = this.calculateShot(pointer, 110);
        this.fireRayAttack(rayData);

        this.rayTickData = rayData;
        this.meleeRayTick = true;

        if (this.doesFireWave) {
        this.fireWave(data, angleDeg)
        }

        // Cleanup
        this.scene.time.delayedCall(this.meleeDuration, () => {
            this.meleeRayTick = false;
            this.sword.destroy();
            delete this.sword;
        });
    }

    fireWave({end, direction}, angleDeg) {
        const speed = direction.clone().scale(400);
        this.wave = new SwordWave( this.scene, end.x, end.y, this.player, this );
        this.wave.setAngle(angleDeg);
        this.wave.setFlipY( angleDeg > 90 || angleDeg < -90 );
        this.wave.setVelocity(speed.x, speed.y)

    }
}
