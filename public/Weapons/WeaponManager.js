import WeaponShurikan from './WeaponShurikan.js'
import WeaponSword from './WeaponSword.js';

const weaponTypes = {
    shurikan: WeaponShurikan,
    sword: WeaponSword,
};

export function createWeapon(type, scene, player) {
    const WeaponClass = weaponTypes[type];
    return new WeaponClass(scene, player)
}