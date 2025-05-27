export default class WeaponProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'shurikan', player, damage = 1) {
        super(scene, x, y, id);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hitSound = 'shurikanhit';
        this.baseDamage = damage;
        this.hitTargets = [];
        this.destroyOnHit = true;

    }

    bulletHit(bullet) {
        if (!this.canHit(bullet)) return;
        this.playHitSound();
        bullet.destroy();
        if (this.destroyOnHit) this.destroy();
    }

    platformHit(plat) {
        if (this.destroyOnHit) this.destroy();
    }

    enemyHit(enemy) {
        const velocity = this.body.velocity;

        if (this.canHit(enemy)) {
            if (enemy.TakeDamage(this.player, this.baseDamage, velocity)) {
                this.playHitSound();
                if (this.destroyOnHit) this.destroy();
                return;
            }
        }
    }

    itemHit(target) {
        const velocity = this.body.velocity;

        if (!this.canHit(target)) return;
        this.playHitSound();
        target.hit?.(this.player, this.baseDamage, velocity);
        if (this.destroyOnHit) this.destroy();
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;
        this.hitTargets.push(target);
        return true;
    }

    playHitSound() {
        if (this.scene && this.scene.sound.get(this.hitSound)) {
            this.scene.sound.play(this.hitSound);
        } else {
            scene.sound.add(this.hitSound);
            this.scene.sound.play(this.hitSound);
        }
    }
}
