export default class Weapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'shurikan', player, damage, weaponManager, throwSound = 'shurikanthrow', hitSound = 'shurikanhit') {
        super(scene, x, y, id);
        this.scene = scene;
        this.player = player;
        this.weaponManager = weaponManager;
        this.throwSound = throwSound;
        this.hitSound = hitSound;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.baseDamage = damage;
        this.hitTargets = [];

    }

    bulletHit(bullet) {
        if (!this.canHit(bullet)) return;
        this.playHitSound();
        bullet.destroy();
        this.destroy();
    }

    platformHit(plat) {
        this.destroy();
    }

    enemyHit(enemy) {
        const velocity = this.body.velocity;

        if (this.canHit(enemy)) {
            if (enemy.TakeDamage(this.player, this.baseDamage, velocity)) {
                this.playHitSound();
                this.destroy();
                return;
            }
        }
    }

    itemHit(target) {
        const velocity = this.body.velocity;

        if (!this.canHit(target)) return;
        this.playHitSound();
        target.hit?.(this.player, this.baseDamage, velocity);
        this.destroy();
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;
        this.hitTargets.push(target);
        return true;
    }

    playThrowSound() {
        if (this.scene && this.scene.sound.get(this.throwSound)) {
            this.scene.sound.play(this.throwSound);
        } else {
            scene.sound.add(this.throwSound);
            this.scene.sound.play(this.throwSound);
        }
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
