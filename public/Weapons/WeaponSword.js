import WeaponBase from './WeaponBase.js';
import WeaponSprite from './WeaponSprite.js'; // projectile sprite

export default class WeaponSword extends WeaponBase {
    constructor() {
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();
    }
}