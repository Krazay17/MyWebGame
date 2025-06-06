import GameManager from "../things/GameManager.js";
import WeaponBase from "./_weaponbase.js";
import AuraSprite from "./auraSprite.js";
import DarkOrbProjectile from "./darkOrbProjectile.js";
import ZapSprite from "./zapSprite.js";

export default class AuraZap extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 1);
        this.maxTargets = 1;
        this.baseZapCd = 5000;
        this.upA = 0;
        this.upB = 0;

        this.upgradeACost = 2000;

        this.upgradeCosts = { A1: 2000, A2: 3000, B1: 5000, B2: 6000, };

        this.auraSprite = new AuraSprite(scene, player.x, player.y, GameManager.power.auraLevel);

        this.zapTimer = this.scene.time.addEvent({
            delay: 5000,
            callback: () => {
                this.fire();
            },
            loop: true,
        }, this);

        this.setStats();
    }

    update(delta) {
        super.update(delta);
        this.auraSprite.setPosition(this.player.x, this.player.y);
    }

    getCost() {
        const level = GameManager.power.auraLevel
        return (level ** 3) + (level * 50);
    }

    tryIncreaseAura() {
        const level = GameManager.power.auraLevel;
        const cost = level ** 3 + level * 50;

        if (GameManager.power.source >= cost) {
            this.player.updateSource(-cost);
            GameManager.power.auraLevel += 1;
            GameManager.power.spent += cost;
            GameManager.save();
            this.setStats();
            return true;
        } else return false;
    }

    damage() {
        return this.baseDamage + this.upA + this.upB;
    }

    setStats() {
        if (this.zapTimer.delay) {
            this.zapTimer.delay = this.baseZapCd / GameManager.power.auraLevel;
        }

        if (GameManager.power.auraUpgradeA) {
            switch (GameManager.power.auraUpgradeA) {
                case 1:
                    this.maxTargets = 2;
                    break;
                case 2:
                    this.baseDamage += 2;
                    break;
                default:
                    this.maxTargets = 1;
                    this.baseDamage = 1;
                    break;
            }
        }

        if (GameManager.power.auraUpgradeB) {
            switch (GameManager.power.auraUpgradeB) {
                case 1:
                    this.spawnOrb = true;
                    break;
                case 2:
                    this.baseDamage += 2;
                    break;
                default:
                    this.spawnOrb = false;
                    this.baseDamage = 1;
                    break;
            }
        }
        console.log(this.baseDamage)

        this.player.network.socket.emit('playerLevel', GameManager.power);
    }

    fire() {
        const groups = this.scene.attackableGroups;
        const range = Phaser.Math.Clamp(GameManager.power.auraLevel * 25, 250, 600);
        const playerPos = this.player.getCurrentPos();
        const validTargets = [];

        this.hitTargets = [];

        groups.forEach(({ zap, group, handler }) => {
            if (!zap) return;

            group.getChildren().forEach(target => {
                const targetPos = new Phaser.Math.Vector2(target.x, target.y);
                const distance = Phaser.Math.Distance.BetweenPoints(playerPos, targetPos);

                if (distance <= range) {
                    validTargets.push({
                        target,
                        distance,
                        handler,
                        pos: targetPos
                    });
                }
            });
        });

        // Sort by distance, ascending
        validTargets.sort((a, b) => a.distance - b.distance);

        // Hit up to this.maxTargets
        for (let i = 0; i < Math.min(validTargets.length, this.maxTargets); i++) {
            const { target, handler, pos } = validTargets[i];
            this[handler]?.(target);
            this.zapVisual(target.x, target.y, target);
            if (this.spawnOrb) {
                const orb = new DarkOrbProjectile(this.scene, target.x, target.y, this.player);
                this.scene.weaponGroup.add(orb);
                orb.setScale(.1);
                orb.detonate = true;
            }
        }
    }


    zapVisual(x, y, target) {
        this.zapLine = new ZapSprite(this.scene, x, y, this.player, target)

    }

    upgradeA(upgrade) {
        const { A1, A2 } = this.upgradeCosts
        switch (upgrade) {
            case 1:
                if (GameManager.power.source > A1) {
                    this.player.updateSource(-A1)
                    GameManager.power.spent += A1;
                    GameManager.power.auraUpgradeA = 1;
                    GameManager.save();

                    this.maxTargets = 2;

                    return true;
                }
            case 2:
                if (GameManager.power.source > A2) {
                    this.player.updateSource(-A2)
                    GameManager.power.spent += A2;
                    GameManager.power.auraUpgradeA = 2;
                    GameManager.save();

                    this.upA = 2;

                    return true;
                }
        }
        return false;
    }

    upgradeB(upgrade) {
        const { B1, B2 } = this.upgradeCosts
        switch (upgrade) {
            case 1:
                if (GameManager.power.source > B1) {
                    this.player.updateSource(-B1)
                    GameManager.power.spent += B1;
                    GameManager.power.auraUpgradeB = 1;
                    GameManager.save();

                    this.spawnOrb = true;

                    return true;
                }
            case 2:
                if (GameManager.power.source > B2) {
                    this.player.updateSource(-B2)
                    GameManager.power.spent += B2;
                    GameManager.power.auraUpgradeB = 2;
                    GameManager.save();

                    this.upB = 2

                    return true;
                }
        }
        return false;
    }

    resetUpgrades() {
        GameManager.power.auraLevel = 1;
        GameManager.power.auraUpgradeA = null;
        GameManager.power.auraUpgradeB = null;
        this.setStats();
    }
}