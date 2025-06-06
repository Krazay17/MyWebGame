import WeaponProjectile from "./_baseWeaponProjectile.js";

export default class ShurikanProjectile extends WeaponProjectile {
    constructor(scene, x, y, player, chainCount = 0, damage = 1) {
        super(scene, x, y, 'shurikan', player, damage);

        this.maxTargets = 1;
        this.chainCount = chainCount;
        this.destroyOnHit = false;
        this.shrinkCollision(this, this.width/1.6, this.height/1.6)

        // Spin tween
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 300,
            repeat: -1,
            ease: 'Linear',
        });

        // Cleanup
        scene.time.delayedCall(700, () => this.destroy());

    }

    enemyHit(enemy, stagger = true) {
        if (!this.canHit(enemy)) return;

        const velocity = this.body.velocity;

        if (enemy.TakeDamage(this.player, this.baseDamage, stagger? velocity : null)) {
            this.playHitSound();
        }
        console.log(this.chainCount);

        if ((this.chainCount > 0)) {
            this.chainAttack(enemy);
            this.setVelocity(0)
            this.scene.time?.delayedCall(25, () =>{
            this.destroy();

            })
        } else {
            this.setVelocity(0)
            this.scene.time?.delayedCall(25, () =>{
            this.destroy();

            })
        }
    }

    bulletHit(target) {
        super.bulletHit(target);

        if (this.chainCount > 0) {
            this.chainAttack(target);
            this.destroy();
        } else {
            this.destroy();
        }
    }

    itemHit(item) {
        super.itemHit(item);

    }

    chainAttack(enemy) {
        const groups = this.scene.attackableGroups;
        const range = 400;
        const thisPos = new Phaser.Math.Vector2(this.x, this.y)
        const validTargets = [];

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
            chainShurikan.hitTargets.push(enemy);
            this.scene.weaponGroup.add(chainShurikan);
            const direction = pos.subtract(thisPos).normalize().scale(1000);
            chainShurikan.allowGravity = false;
            chainShurikan.setVelocity(direction.x, direction.y)
            chainShurikan.setScale(.11)

        }
    }

      shrinkCollision(object, x, y) {
    object.body.setSize(x, y); // Smaller than sprite size
    object.body.setOffset(
      (object.width - x) / 2,
      (object.height - y) / 2
    );
  }
}
