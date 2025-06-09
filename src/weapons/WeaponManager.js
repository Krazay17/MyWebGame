import WeaponShurikan from './WeaponShurikan.js'
import WeaponSword from './WeaponSword.js'
import WeaponDarkOrb from './WeaponDarkOrb.js'
import WeaponWhip from './WeaponWhip.js'
import AuraZap from './WeaponAuraZap.js'

const weaponTypes = {
    shurikan: WeaponShurikan,
    sword: WeaponSword,
    darkorb: WeaponDarkOrb,
    whip: WeaponWhip,
    zap: AuraZap,
};

export const weaponUpgradeCosts = { shurikanA: 1000, shurikanB: 500, shurikanC: 2500 , swordA: 1000 };

export function createWeapon(type, scene, player) {
    const WeaponClass = weaponTypes[type];
    return new WeaponClass(scene, player)
}