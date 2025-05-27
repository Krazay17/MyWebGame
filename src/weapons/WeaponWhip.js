import WeaponBase from './_weaponbase.js';

export default class WeaponWhip extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 1)

        this.baseCooldown = 500;
        this.meleeDuration = 250;
        this.spamAdd = 100;
        this.hitSoundId = 'energysound';
        this.whipConnect = false;

        if (!scene.anims.get('whip')) {
            scene.anims.create({
                key: 'whip',
                defaultTextureKey: 'whip',
                duration: 100,
                frames: [
                    { frame: 0 },
                    { frame: 1 },
                    { frame: 2 },
                    { frame: 3 },
                    { frame: 4 },
                ],
            })
        }

        if (!scene.anims.get('whipend')) {
            scene.anims.create({
                key: 'whipend',
                defaultTextureKey: 'whip',
                duration: 100,
                frames: [
                    { frame: 4 },
                    { frame: 3 },
                    { frame: 2 },
                    { frame: 1 },
                    { frame: 0 },
                ],
                hideOnComplete: true,
            })
        }
    }
    update(delta) {
        super.update(delta);
        if (this.sword) {
            this.sword.x = this.player.x;
            this.sword.y = this.player.y - 15 + this.swordOffset.y;
        }

        if (this.whipConnect && this.hitLocation && !this.player.stunned) {
            this.meleeRayTick = false;
            this.wasGrappling = true;
            const g = this.scene.add.graphics();
            // g.lineStyle(4, 0xffffff, 1);
            // g.beginPath();
            // g.moveTo(this.player.x, this.player.y);
            // g.lineTo(this.hitLocation.x, this.hitLocation.y);
            // g.strokePath();
            this.scene.physics.accelerateTo(this.player, this.hitLocation.x, this.hitLocation.y, 3200, 1000, 300);
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.hitLocation.x, this.hitLocation.y
            );
            const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.sword.x, this.sword.y, this.hitLocation.x, this.hitLocation.y));
            
            this.sword.setAngle(angleDeg);
            this.sword.setScale(this.mapRangeClamped(distance, 25, 200, 0.02, 0.4))
            if(distance < 100 || distance > 350 && this.sword) {
                this.sword.play('whipend')
                this.whipConnect = false
            }
        } else if (this.wasGrappling) {
            this.player.body.setAcceleration(0, 0);
            this.player.body.setMaxSpeed(1200);
            this.player.body.maxVelocity.x =1200;
            this.player.body.maxVelocity.y =1200;
            this.hitLocation = null;
            this.wasGrappling = false;

        }
    }

    fire(pointer) {
        if (this.sword) return;
        if (!this.canFire()) return;
        this.clearHits();
        this.playThrowSound();

        const data = this.calculateShot(pointer, 1);
        const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(data.start.x, data.start.y, data.cursorPos.x, data.cursorPos.y));

        this.swordOffset = data.vector;

        this.sword = this.scene.add.sprite(data.start.x + data.vector.x, data.start.y + data.vector.y, 'whip')
            .setScale(0.45)
            .setOrigin(0, .5)
            .setAngle(angleDeg);
        this.sword.play('whip');
        this.sword.setFlipY(angleDeg > 90 || angleDeg < -90);

        const rayData = this.calculateShot(pointer, 250);

        this.rayTickData = { ...rayData };

        this.sword.once('animationcomplete-whipend', () => {
            this.stopWhip();
        });
        this.sword.once('animationcomplete-whip', () => {
            this.meleeRayTick = true;
        });
        // Cleanup
        // this.scene.time.delayedCall(this.meleeDuration, () => {
        //     this.meleeRayTick = false;
        //     this.sword.destroy();
        //     delete this.sword;
        // });
    }

    release() {
        this.meleeRayTick = false;
        this.whipConnect = false;
        if (this.sword) this.sword.play('whipend')
    }

    platformHit(plat, hitLocation) {
        this.hitLocation = hitLocation;
        this.sword.stop()
        this.sword.setFrame(4)
        this.whipConnect = true;
    }

    itemHit(item, hitLocation) {
        this.hitLocation = hitLocation;
        this.sword.stop()
        this.sword.setFrame(4)
        this.whipConnect = true;
    }

    stopWhip() {
        this.startCooldown();
        this.sword.destroy();
        delete this.sword;
    }
}
