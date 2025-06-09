import { playHitSound } from "../things/soundUtils.js";

export default class WeaponProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'shurikan', player, damage = 1) {
        super(scene, x, y, id);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene.weaponGroup.add(this);

        this.hitSoundId = 'shurikanhit';
        this.baseDamage = damage;
        this.hitTargets = [];
        this.destroyOnHit = true;

    }

    bulletHit(bullet) {
        if (!this.canHit(bullet)) return;
        playHitSound(this.scene, this.hitSoundId);
        bullet.destroy();
    }

    platformHit(plat) {
        if (this.destroyOnHit) this.destroy();
    }

    TouchPlatform() { }

    enemyHit(enemy, stagger = true) {
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity;

        if (enemy.TakeDamage(this.player, this.baseDamage, stagger ? velocity : null)) {
            playHitSound(this.scene, this.hitSoundId);
            return;
        }
    }

    itemHit(target) {
        if (!this.canHit(target)) return;

        const velocity = this.body.velocity;
        playHitSound(this.scene, this.hitSoundId);
        target.hit?.(this.player, this.baseDamage, velocity);
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;
        this.hitTargets.push(target);
        return true;
    }

    shrinkCollision(object, x, y) {
        object.body.setSize(x, y); // Smaller than sprite size
        object.body.setOffset(
            (object.width - x) / 2,
            (object.height - y) / 2
        );
    }

    customBounce(scale = 1) {
        const body = this.body;
        console.log('bounce')

        if (!body) return;

        // Flip velocity on touch direction
        if (body.blocked.left || body.touching.left) {
            body.setVelocityX(Math.abs(body.velocity.x * scale));
        } else if (body.blocked.right || body.touching.right) {
            body.setVelocityX(-Math.abs(body.velocity.x * scale));
        }

        if (body.blocked.up || body.touching.up) {
            body.setVelocityY(Math.abs(body.velocity.y * scale));
        } else if (body.blocked.down || body.touching.down) {
            body.setVelocityY(-Math.abs(body.velocity.y * scale));
        }
    }

}
