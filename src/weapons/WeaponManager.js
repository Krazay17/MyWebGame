import WeaponShurikan from './WeaponShurikan.js'
import WeaponSword from './WeaponSword.js'
import WeaponDarkOrb from './WeaponDarkOrb.js'
import WeaponWhip from './WeaponWhip.js'
import AuraZap from './WeaponAuraZap.js'
import GameManager from '../things/GameManager.js'

const weaponTypes = {
    shurikan: WeaponShurikan,
    sword: WeaponSword,
    darkorb: WeaponDarkOrb,
    whip: WeaponWhip,
    zap: AuraZap,
};
export function createWeapon(type, scene, player) {
    const WeaponClass = weaponTypes[type];
    return new WeaponClass(scene, player)
}


export const weaponUpgrades = [
    {
        id: 'auraUpgradeLevel',
        x: 1200,
        y: 500,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: () => GameManager.power.auraLevel ** 3 + GameManager.power.auraLevel * 50,
        maxRank: -1,
        tooltip: `Level up aura`,
        apply: () => {
            GameManager.power.auraLevel++;
            GameManager.upgrades.auraUpgradeLevel += 1;
            GameManager.save();
        },
        reset: () => {
            GameManager.power.auraLevel = 1;
        }
    },
    {
        id: 'auraUpgradeA1',
        x: 1100,
        y: 600,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 300,
        maxRank: 1,
        tooltip: `Zap hits 2 targets`,
        disables: ['auraUpgradeA2'],
        apply: () => {
            GameManager.upgrades.auraUpgradeA1 = 1;
        },
        reset: () => {
            GameManager.upgrades.auraUpgradeA1 = 0;
        }
    },
    {
        id: 'auraUpgradeA2',
        x: 1300,
        y: 600,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 200,
        maxRank: 1,
        tooltip: `Zap deals +2 damage`,
        disables: ['auraUpgradeA1'],
        apply: () => {
            GameManager.upgrades.auraUpgradeA2 = 1;
        },
        reset: () => {
            GameManager.upgrades.auraUpgradeA2 = 0;
        }
    },
    {
        id: 'auraUpgradeB1',
        x: 1100,
        y: 700,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 1000,
        maxRank: 1,
        tooltip: `Zap spawns orbs`,
        disables: ['auraUpgradeB2'],
        apply: () => {
            GameManager.upgrades.auraUpgradeB1 = 1;
        },
        reset: () => {
            GameManager.upgrades.auraUpgradeB1 = 0;
        }
    },
    {
        id: 'auraUpgradeB2',
        x: 1300,
        y: 700,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 1000,
        maxRank: 1,
        tooltip: `Zap deals +2 damage`,
        disables: ['auraUpgradeB1'],
        apply: () => {
            GameManager.upgrades.auraUpgradeB2 = 1;
        },
        reset: () => {
            GameManager.upgrades.auraUpgradeB2 = 0;
        }
    },
    {
        id: 'shurikanUpgradeA',
        x: 900,
        y: 200,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 300,
        maxRank: 1,
        tooltip: `Shurikan hits 3 more targets`,
        apply: () => {
            GameManager.upgrades.shurikanUpgradeA = 1;
        },
        reset: () => {
            GameManager.upgrades.shurikanUpgradeA = 0;
        }
    },
    {
        id: 'shurikanUpgradeB',
        x: 900,
        y: 300,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 200,
        maxRank: 1,
        tooltip: `Shurikan deals 1 more damage to first target`,
        apply: () => {
            GameManager.upgrades.shurikanUpgradeB = 1;
        },
        reset: () => {
            GameManager.upgrades.shurikanUpgradeB = 0;
        }
    },
    {
        id: 'shurikanUpgradeC',
        x: 900,
        y: 400,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 1000,
        maxRank: 1,
        tooltip: `Shurikan splits into 3 on first hit`,
        apply: () => {
            GameManager.upgrades.shurikanUpgradeC = 1;
        },
        reset: () => {
            GameManager.upgrades.shurikanUpgradeC = 0;
        }
    },
    {
        id: 'swordUpgradeA',
        x: 1100,
        y: 200,
        icon: 'auraicondesat',
        tint: '0x00FFEE',
        cost: 500,
        maxRank: 1,
        tooltip: `Sword shoots energy wave`,
        apply: () => {
            GameManager.upgrades.swordUpgradeA = 1;
        },
        reset: () => {
            GameManager.upgrades.swordUpgradeA = 0;
        }
    },
]