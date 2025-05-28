import WeaponBase from './_weaponbase.js';

export default class WeaponWhip extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 1)

        this.name = 'whip'
        this.baseCooldown = 500;
        this.meleeDuration = 250;
        this.spamAdd = 100;
        this.hitSoundId = 'energysound';
        this.whipConnect = false;
        this.wasGrappling = false;
        this.rayTrackEnd = false;

        if (!scene.anims.get('whip')) {
            scene.anims.create({
                key: 'whip',
                defaultTextureKey: 'whip',
                duration: 150,
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
        if (this.weaponSprite) {
            this.weaponSprite.x = this.player.x;
            this.weaponSprite.y = this.player.y - 25 + this.weaponSpriteOffset.y;
        }

        if (this.weaponSprite && this.whipConnect && this.hitLocation && this.holding) {
            console.log(this.hitLocation)
            this.wasGrappling = true;
            this.rayTrackEnd = true;
            // const g = this.scene.add.graphics();
            // g.lineStyle(4, 0xffffff, 1);
            // g.beginPath();
            // g.moveTo(this.player.x, this.player.y);
            // g.lineTo(this.hitLocation.x, this.hitLocation.y);
            // g.strokePath();
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.hitLocation.x, this.hitLocation.y
            );
            this.rayTickData.end.x = this.hitLocation.x;
            this.rayTickData.end.y = this.hitLocation.y;
            const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.weaponSprite.x, this.weaponSprite.y, this.hitLocation.x, this.hitLocation.y));

            if (distance > 100) this.scene.physics.accelerateTo(this.player, this.hitLocation.x, this.hitLocation.y, 3000, 450, 450);
            this.weaponSprite.setAngle(angleDeg);
            this.weaponSprite.setScale(this.mapRangeClamped(distance, 25, 400, 0.02, 0.6))
            if (distance >600 && this.weaponSprite) {
                this.weaponSprite.play('whipend')
                this.whipConnect = false
            }
        } 
        else if (this.wasGrappling) {
            this.player.body.setAcceleration(0, 0);
            this.player.body.setMaxSpeed(1200);
            this.player.body.maxVelocity.x = 1200;
            this.player.body.maxVelocity.y = 1200;
            this.rayTrackEnd = false;
            this.whipConnect = false;
            this.meleeRayTick = false;
            if (this.weaponSprite) {
                this.weaponSprite.play('whipend', true);
            }
            this.wasGrappling = false;
        }
    }

    fire(pointer) {
        if (this.weaponSprite) return;
        if (!this.canFire()) return;
        this.clearHits();
        this.playThrowSound();

        const data = this.calculateShot(pointer, 15);
        const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(data.start.x, data.start.y, data.cursorPos.x, data.cursorPos.y));

        this.weaponSpriteOffset = data.vector;

        this.weaponSprite = this.scene.add.sprite(data.start.x + data.vector.x, data.start.y + data.vector.y, 'whip')
            .setScale(0.48)
            .setOrigin(0, .5)
            .setAngle(angleDeg);
        this.weaponSprite.play('whip');
        this.weaponSprite.setFlipY(angleDeg > 90 || angleDeg < -90);

        const rayData = this.calculateShot(pointer, 235);
        this.rayTickData = rayData;
        this.holding = true;
        // this.weaponSprite.on('animationcomplete-whip', () => {
        //     this.meleeRayTick = true;
        // });

        this.scene.time.delayedCall(50, () => this.meleeRayTick = true)

        this.weaponSprite.on('animationcomplete-whipend', () => {
            this.stopWhip();
        });

        this.player.on('playerstunned', () => this.release());
    }

    release() {
        this.whipConnect = false;
        this.holding = false;
        this.meleeRayTick = false;
        if (this.weaponSprite && this.weaponSprite.anims.isPlaying) {
            this.weaponSprite.chain('whipend');
        } else if (this.weaponSprite){
            this.weaponSprite.play('whipend');
        }
    }

    platformHit(plat, hitLocation) {
        if (this.whipConnect && hitLocation) return;
        this.hitLocation = hitLocation;
        this.whipConnect = true;
        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.setFrame(4)
        }
    }

    itemHit(item, hitLocation) {
        if (this.whipConnect && hitLocation) return;
        this.hitLocation = hitLocation;
        this.whipConnect = true;
        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.setFrame(4)
        }
    }

    connect(hitRect) {

    }

    stopWhip() {
        this.startCooldown();
        this.whipConnect = false;
        this.meleeRayTick = false;
        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.destroy();
            delete this.weaponSprite;
        }
    }
}
