import WeaponBase from './_weaponbase.js';
import DarkOrbProjectile from './darkOrbProjectile.js';

export default class WeaponDarkOrb extends WeaponBase {
    constructor(scene, player, group) {
        super(scene, player, group);
        scene.sound.add('shurikanhit');
        scene.sound.add('shurikanthrow');

        scene.anims.create({
            key: 'darkorb',
            frames: scene.anims.generateFrameNumbers('darkorb', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        })
    }

    fire(pointer) {
        if (this.projectile) return;

        const {start, vector} = this.calculateShot(pointer, 100);

        this.projectile = new DarkOrbProjectile(this.scene, start.x, start.y, this.player);
        this.scene.weaponGroup.add(this.projectile);
        this.projectile.allowGravity = false;
        this.projectile.setScale(.35);
        this.projectile.setVelocity(vector.x, vector.y);

        // Spin tween
        this.scene.tweens.add({
            targets: this.projectile,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
        });
        this.playThrowSound();
    }
    
    release() {
        if (this.projectile)
        this.projectile.destroy();
        delete this.projectile;
    }
}
