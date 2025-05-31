import WeaponBase from './_weaponbase.js';
import ShurikanProjectile from './shurikanProjectile.js';

export default class WeaponShurikan extends WeaponBase {
    constructor(scene, player) {
        super(scene, player);
        this.name = 'shurikan';
        this.baseCooldown = 50;
        this.spamAdd = 90;
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();

        const {start, vector} = this.calculateShot(pointer, 1000);

        const projectile = new ShurikanProjectile(this.scene, start.x, start.y, this.player, 2);
        this.scene.weaponGroup.add(projectile);
        projectile.setBounce(.8);
        projectile.allowGravity = false;
        projectile.setScale(.15);
        projectile.setVelocity(vector.x, vector.y);


        this.playThrowSound();
    }
}
