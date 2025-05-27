import WeaponBase from './_weaponbase.js';
import WeaponProjectile from './_baseWeaponProjectile.js'; // projectile sprite

export default class WeaponShurikan extends WeaponBase {
    constructor(scene, player, group) {
        super(scene, player, group);
        scene.sound.add('shurikanhit');
        scene.sound.add('shurikanthrow');
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();

        const {start, vector} = this.calculateShot(pointer, 1000);

        const projectile = new WeaponProjectile(this.scene, start.x, start.y, 'shurikan', this.player, 1, true, this);
        this.scene.weaponGroup.add(projectile);
        projectile.allowGravity = false;
        projectile.setScale(.15);
        projectile.setVelocity(vector.x, vector.y);

        // Spin tween
        this.scene.tweens.add({
            targets: projectile,
            angle: 360,
            duration: 300,
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
