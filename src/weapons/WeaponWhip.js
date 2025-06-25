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
            this.weaponSprite.y = this.player.y - this.headOffset + this.weaponSpriteOffset.y;
        }

        if (!this.connected) return;

        const scaledDelta = delta / 1000;
        const { dist, tangVel, angle } = this.grappleMath(this.anchor);
        if (dist > 500 || dist < 70) {
            this.release();
            return;
        }

        this.length = dist;
        this.angle = angle;

        // --- Recalc angularVelocity ---
        const playerMomentum = tangVel / dist;
        this.angularVelocity = Phaser.Math.Linear(this.angularVelocity, playerMomentum, 0.05);

        // --- Add gravity-like acceleration ---
        const correctedAngle = this.angle - Math.PI / 2;
        const angularAccel = -(600 / this.length) * Math.sin(correctedAngle);
        this.angularVelocity += angularAccel * scaledDelta;

        // Optional: add some damping (tiny amount, not instant)
        this.angularVelocity *= 0.9995;

        // --- Advance angle ---
        // if (Math.abs(this.angularVelocity) > 0.001) {
        //     this.angle += this.angularVelocity * scaledDelta;
        // }

        // --- Compute velocity ---
        const vx = this.angularVelocity * dist * -Math.sin(this.angle);
        const vy = this.angularVelocity * dist * Math.cos(this.angle);

        this.player.setVelocity(vx, vy);

        if (this.weaponSprite) {
            // --- Update visuals ---
            const angleDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(
                this.weaponSprite.x, this.weaponSprite.y,
                this.anchor.x, this.anchor.y
            ));

            this.weaponSprite.setAngle(angleDeg);
            this.weaponSprite.setScale(this.mapRangeClamped(dist, 25, 400, 0.02, 0.6));
        }

    }

    grappleMath(hitLocation) {
        const dx = this.player.x - hitLocation.x;
        const dy = this.player.y - hitLocation.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const tangX = -dy / dist;
        const tangY = dx / dist;
        const tangVel = (this.player.body.velocity.x * tangX) + (this.player.body.velocity.y * tangY);
        const angle = Math.atan2(dy, dx);

        return { dx, dy, dist, tangVel, angle };
    }

    connect(hitLocation) {
        if(!this.holding) return;
        this.anchor = hitLocation;
        const { dist, tangVel, angle } = this.grappleMath(this.anchor);
        this.angle = angle;

        const minSpeed = 700;

        const clampedVel = Math.sign(tangVel) * Math.max(Math.abs(tangVel), minSpeed);
        this.angularVelocity = clampedVel / dist;

        this.connected = true;
        this.player.body.allowGravity = false;
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
            .setAngle(angleDeg)
            .setDepth(101);
        this.weaponSprite.play('whip');
        this.weaponSprite.setFlipY(angleDeg > 90 || angleDeg < -90);

        const rayData = this.calculateShot(pointer, 260);
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
        this.connected = false;
        this.player.body.allowGravity = true;
        this.whipConnect = false;
        this.holding = false;
        this.meleeRayTick = false;
        if (this.weaponSprite && this.weaponSprite.anims.isPlaying) {
            this.weaponSprite.chain('whipend');
        } else if (this.weaponSprite) {
            this.weaponSprite.play('whipend');
        }
    }

    platformHit(plat, stagger, hitLocation) {
        if (this.whipConnect && hitLocation) return;
        this.connect(hitLocation);
        this.hitLocation = hitLocation;
        this.whipConnect = true;
        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.setFrame(4)
        }
    }

    itemHit(item, stagger, hitLocation) {
        if (this.whipConnect && hitLocation) return;
        this.connect(hitLocation);
        this.hitLocation = hitLocation;
        this.whipConnect = true;
        if (this.weaponSprite) {
            this.weaponSprite.stop();
            this.weaponSprite.setFrame(4)
        }
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
