export default class WeaponProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'shurikan', player, damage = 1) {
        super(scene, x, y, id);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hitSoundId = 'shurikanhit';
        this.baseDamage = damage;
        this.hitTargets = [];
        this.destroyOnHit = true;

    }

    bulletHit(bullet) {
        if (!this.canHit(bullet)) return;
        this.playHitSound();
        bullet.destroy();
    }

    platformHit(plat) {
        if (this.destroyOnHit) this.destroy();
    }

    enemyHit(enemy) {
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity;

        if (enemy.TakeDamage(this.player, this.baseDamage, velocity)) {
            this.playHitSound();
            return;
        }
    }

    itemHit(target) {
        if (!this.canHit(target)) return;

        const velocity = this.body.velocity;

        this.playHitSound();
        target.hit?.(this.player, this.baseDamage, velocity);
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;
        this.hitTargets.push(target);
        return true;
    }

    playHitSound() {
        if (!this.hitSound) {
            this.hitSound = this.scene.sound.add(this.hitSoundId);
        };
        if (this.hitSound.isPlaying) {
            this.hitSound.stop();
        }
        this.hitSound.play();
    }
}
