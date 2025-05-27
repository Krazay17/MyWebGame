import WeaponShurikan from './WeaponShurikan.js'
import WeaponSword from './WeaponSword.js'
import WeaponDarkOrb from './WeaponDarkOrb.js';
import WeaponWhip from './WeaponWhip.js';

const weaponTypes = {
    shurikan: WeaponShurikan,
    sword: WeaponSword,
    darkorb: WeaponDarkOrb,
    whip: WeaponWhip,
};

export function createWeapon(type, scene, player) {
    const WeaponClass = weaponTypes[type];
    return new WeaponClass(scene, player)
}