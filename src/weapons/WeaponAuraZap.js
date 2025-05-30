import GameManager from "../things/GameManager.js";
import WeaponBase from "./_weaponbase.js";
import AuraSprite from "./auraSprite.js";
import ZapSprite from "./zapSprite.js";

export default class AuraZap extends WeaponBase {
    constructor(scene, player) {
        super(scene, player, 1);
        this.maxTargets = 1;
        this.level = GameManager.power.auraLevel;
        this.baseZapCd = 5000;

        this.auraSprite = new AuraSprite(scene, player.x, player.y, this.level);

        this.zapTimer = this.scene.time.addEvent({
            delay: 5000,
            callback: () => {
                this.fire();
            },
            loop: true,
        }, this);

        this.setStats();
        this.setLevel(this.level)
    }

    update(delta) {
        super.update(delta);
        this.auraSprite.setPosition(this.player.x, this.player.y);
        console.log('auratick');
    }

    getCost() {
        return this.level * 50;
    }

    setLevel(level) {
        if (level) {
        this.level = level;
        this.auraSprite.setAuraLevel(this.level);
        this.setStats();
        return this.level;
        }
        this.level++;
        this.auraSprite.setAuraLevel(this.level);
        this.setStats();
    }

    setStats() {
        if (this.zapTimer.delay) {
            this.zapTimer.delay = this.baseZapCd / this.level;
        }
    }

fire() {
    const groups = this.scene.attackableGroups;
    const range = Phaser.Math.Clamp(this.level * 50, 200, 800);
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
        this[handler]?.(target, pos);
        this.zapVisual(target.x, target.y, target);
        this.hitTargets.push(target);
    }
}


    zapVisual(x, y, target) {
        this.zapLine = new ZapSprite(this.scene, x, y, this.player, target)

    }
}