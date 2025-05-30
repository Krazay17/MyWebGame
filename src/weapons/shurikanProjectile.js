import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class ShurikanProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, chainCount = 0) {
        super(scene, x, y, 'shurikan', player, 1);

        this.maxTargets = 2;
        this.chainCount = chainCount;

        // Spin tween
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 300,
            repeat: -1,
            ease: 'Linear',
        });

    }

    enemyHit(enemy) {
        super.enemyHit(enemy);

        if (this.chainCount > 0) {
            this.chainAttack(enemy);
            this.destroy();
        } else {
            this.destroy();
        }
    }

    bulletHit(target) {
        super.bulletHit(target);

        this.chainAttack(target);
        this.destroy();
    }

    itemHit(item) {
        super.itemHit(item);

        this.chainAttack(item);
        this.destroy();
    }

    chainAttack(enemy) {
        const groups = this.scene.attackableGroups;
        const range = 500;
        const thisPos = new Phaser.Math.Vector2(this.x, this.y)
        const validTargets = [];

        this.hitTargets = [];

        groups.forEach(({ zap, group, handler }) => {
            if (!zap) return;

            group.getChildren().forEach(target => {
                const targetPos = new Phaser.Math.Vector2(target.x, target.y);
                const distance = Phaser.Math.Distance.BetweenPoints(thisPos, targetPos);

                if (target !== enemy && distance <= range) {
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
            this.chainCount--;
            const chainShurikan = new ShurikanProjectile(this.scene, thisPos.x, thisPos.y, this.player, this.chainCount)
            const direction = pos.subtract(thisPos).normalize().scale(1000);
            //chainShurikan.hitTargets.push(target);
            this.scene.weaponGroup.add(chainShurikan);
            chainShurikan.allowGravity = false;
            chainShurikan.setVelocity(direction.x, direction.y)
            chainShurikan.setScale(.11)

            this.hitTargets.push(target);
        }
    }
}
