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

    enemyHit(enemy, stagger = true) {
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity;

        if (enemy.TakeDamage(this.player, this.baseDamage, stagger? velocity : null)) {
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
    // Hard exit if the tab is not active
    if (document.visibilityState !== 'visible') return;

    const now = this.scene.time.now;

    // Prevent spam
    if (!this.lastPlayTime || now - this.lastPlayTime > 30) {
        this.lastPlayTime = now;

        // Only try to play if the audio system is unlocked and the tab is visible
        if (this.scene.sound.locked) return;

        // Clean, simple, no pooling
        this.scene.sound.play(this.hitSoundId);
    }
}


}
