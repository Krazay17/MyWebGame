import WeaponBase from './_weaponbase.js';

export default class WeaponWhip extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 1);

        this.name = 'whip';
        this.baseCooldown = 500;
        this.meleeDuration = 250;
        this.spamAdd = 100;
        this.hitSoundId = 'energysound';

        this.isConnected = false;
        this.wasGrappling = false;
        this.rayTrackEnd = false;
        this.hitLocation = null;
        this.grappleSpeed = 3000;
        this.isHolding = false;

        this.createAnimations(scene);
    }

    createAnimations(scene) {
        if (!scene.anims.get('whip')) {
            scene.anims.create({
                key: 'whip',
                defaultTextureKey: 'whip',
                duration: 150,
                frames: scene.anims.generateFrameNumbers('whip', { start: 0, end: 4 })
            });
        }

        if (!scene.anims.get('whipend')) {
            scene.anims.create({
                key: 'whipend',
                defaultTextureKey: 'whip',
                duration: 100,
                frames: scene.anims.generateFrameNumbers('whip', { start: 4, end: 0 }),
                hideOnComplete: true
            });
        }
    }

    update(delta) {
        super.update(delta);
        if (!this.weaponSprite) return;

        this.weaponSprite.setPosition(
            this.player.x,
            this.player.y - 25 + this.weaponSpriteOffset.y
        );

        if (this.weaponSprite && this.isConnected && this.hitLocation) {
            this.wasGrappling = true;
            this.rayTrackEnd = true;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.hitLocation.x, this.hitLocation.y
            );

            this.rayTickData.end.x = this.hitLocation.x;
            this.rayTickData.end.y = this.hitLocation.y;

            const angleDeg = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                    this.weaponSprite.x, this.weaponSprite.y,
                    this.hitLocation.x, this.hitLocation.y
                )
            );

            if (distance > 100) {
                this.scene.physics.accelerateTo(
                    this.player,
                    this.hitLocation.x,
                    this.hitLocation.y,
                    this.grappleSpeed,
                    450,
                    450
                );
            }

            this.weaponSprite.setAngle(angleDeg);
            this.weaponSprite.setScale(this.mapRangeClamped(distance, 25, 400, 0.02, 0.6));

            if (distance > 600) {
                this.weaponSprite.play('whipend');
                this.isConnected = false;
            }
        } else if (this.wasGrappling) {
            this.player.body.setAcceleration(0, 0);
            this.player.body.setMaxSpeed(1200);
            this.player.body.maxVelocity.x = 1200;
            this.player.body.maxVelocity.y = 1200;

            this.rayTrackEnd = false;
            this.isConnected = false;
            this.meleeRayTick = false;

            if (this.weaponSprite) {
                this.weaponSprite.play('whipend', true);
            }

            this.wasGrappling = false;
        }
    }

    fire(pointer) {
        if (!this.canFire() || this.weaponSprite) return;

        this.clearHits();
        this.playThrowSound();
        this.isHolding = true;

        const data = this.calculateShot(pointer, 15);
        const angle = Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(
                data.start.x,
                data.start.y,
                data.cursorPos.x,
                data.cursorPos.y
            )
        );

        this.weaponSpriteOffset = data.vector;

        this.weaponSprite = this.scene.add.sprite(
            data.start.x + data.vector.x,
            data.start.y + data.vector.y,
            'whip'
        )
            .setScale(0.48)
            .setOrigin(0, 0.5)
            .setAngle(angle)
            .setFlipY(angle > 90 || angle < -90)
            .play('whip');

        // Delay ray trace until halfway through animation
        this.scene.time.delayedCall(25, () => {
            if (this.isHolding) {
                this.meleeRayTick = true;
                console.log('tracing?')
                this.rayTickData = this.calculateShot(pointer, 235);
            }
        });

        this.weaponSprite.on('animationcomplete-whip', () => this.meleeRayTick = true);
        this.weaponSprite.on('animationcomplete-whipend', () => this.stopWhip());

        this.player.on('playerstunned', () => this.release());
    }

    platformHit(_, hitLocation) {
        this.connect(hitLocation);
    }

    itemHit(_, hitLocation) {
        this.connect(hitLocation);
    }

    connect(hitLocation) {
        if (!hitLocation || this.isConnected || !this.isHolding) return;

        this.hitLocation = hitLocation;
        this.isConnected = true;

        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.setFrame(4);
        }
    }

    release() {
        this.isHolding = false;
        this.isConnected = false;

        if (this.weaponSprite) {
            this.weaponSprite.play('whipend');
        }
    }

    stopWhip() {
        this.startCooldown();
        this.isConnected = false;
        this.meleeRayTick = false;
        this.hitLocation = null;
        this.isHolding = false;

        if (this.weaponSprite) {
            this.weaponSprite.off('animationcomplete-whip');
            this.weaponSprite.off('animationcomplete-whipend');
            this.weaponSprite.destroy();
            this.weaponSprite = null;
        }
    }
}
