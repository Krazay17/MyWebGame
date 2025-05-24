import WeaponBase from './WeaponBase.js';
import WeaponSprite from './WeaponSprite.js';

export default class WeaponSword extends WeaponBase {
    constructor(scene, player) {
        super(scene, player)
    }

    fire(pointer) {
        if (!this.canFire()) return;
        this.startCooldown();
    }
}