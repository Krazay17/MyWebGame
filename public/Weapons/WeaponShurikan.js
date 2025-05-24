import WeaponBase from './WeaponBase.js';
import WeaponSprite from './WeaponSprite.js'; // projectile sprite

export default class WeaponShurikan extends WeaponBase {
    constructor(scene, player, group) {
        super(scene, player, group);
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();

        const offset = 20;
        const worldPos = pointer.positionToCamera(this.scene.cameras.main);
        const direction = new Phaser.Math.Vector2(worldPos.x - this.player.x, worldPos.y - this.player.y).normalize();
        const velocity = direction.scale(1000);

        const projectile = new WeaponSprite(this.scene, this.player.x, this.player.y - offset, 'shurikan', this.player, 1, true);
        this.weaponGroup.add(projectile);

        projectile.setScale(.15);
        projectile.setVelocity(velocity.x, velocity.y);

        // Spin tween
        this.scene.tweens.add({
            targets: projectile,
            angle: 360,
            duration: 500,
            repeat: -1,
            ease: 'Linear',
        });

        // Cleanup
        this.scene.time.delayedCall(550, () => projectile.destroy());

        // Sound
        const sfx = this.scene.sound;
        if (!sfx.get('shurikanthrow')) sfx.add('shurikanthrow');
        sfx.play('shurikanthrow');
    }
}
