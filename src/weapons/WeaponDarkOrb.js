import WeaponBase from './_weaponbase.js';
import DarkOrbProjectile from './darkOrbProjectile.js';

export default class WeaponDarkOrb extends WeaponBase {
    constructor(scene, player) {
        super(scene, player);

        this.name = 'darkorb';
        this.baseCooldown = 550;
        
        if (!scene.anims.get('darkorb')) {
            scene.anims.create({
                key: 'darkorb',
                frames: scene.anims.generateFrameNumbers('darkorb', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1,
            })
        }
    }

    fire(pointer) {
        if (this.projectile) return;
        if (!this.canFire()) return;
        this.cooldown = true;

        const { start, vector } = this.calculateShot(pointer, 265);

        this.projectile = new DarkOrbProjectile(this.scene, start.x, start.y, this.player, this);
        this.scene.weaponGroup.add(this.projectile);
        this.projectile.allowGravity = false;
        this.projectile.setScale(.35);
        this.projectile.setVelocity(vector.x, vector.y);
        this.projectile.setBounce(1)
        this.projectile.on('bounce')

        this.playThrowSound();

        this.player.on('playerstunned', () => this.release());
    }

    release() {
        if (this.projectile) {
            this.startCooldown();
            this.projectile.detonate = true;
            delete this.projectile;
        }
    }
}
