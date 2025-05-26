export default class WeaponBase {
    constructor(scene, player, damage = 1) {
        this.scene = scene;
        this.player = player;
        this.scene.events.once('shutdown', this.destroy, this);
        this.scene.events.once('destroy', this.destroy, this);

        this.hitTargets = [];
        this.cooldown = false;
        this.cooldownDelay = 200;
        this.baseCooldown = this.cooldownDelay;
        this.meleeRayTick = false;
        this.rayTickData;
        this.offset;
        this.throwSound = 'shurikanthrow';
        this.hitSound = 'shurikanhit';

        this.baseDamage = damage;
        this.spamAdd = 50;
        this.knockStrength = 800;
        this.meleeDuration = this.cooldownDelay;
    }

    update(delta) {
        if (!this.cooldown)
            this.cooldownDelay = Math.max(this.baseCooldown, this.cooldownDelay -= delta * .65);

        if (this.meleeRayTick) {
            this.rayTickData.start.x = this.player.x;
            this.rayTickData.start.y = this.player.y - 25;
            this.fireRayAttack(this.rayTickData);
        }
    }

    canFire() {
        return !this.cooldown;
    }

    startCooldown() {
        this.cooldown = true;
        this.scene.time.delayedCall(this.cooldownDelay, () => {
            this.cooldown = false;
        });

        this.cooldownDelay += this.spamAdd;
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        // any other cleanup here
    }

    calculateShot(pointer, scale = 1) {
        const headOffset = 15;
        const x = this.player.x;
        const y = this.player.y - headOffset;
        const pxy = new Phaser.Math.Vector2(x, y);
        const cursorPos = pointer.positionToCamera(this.scene.cameras.main);
        const tempDirection = new Phaser.Math.Vector2(cursorPos.x - x, cursorPos.y - y).normalize();
        const scaledDistance = tempDirection.clone().scale(scale);

        return {
            start: pxy.clone(),
            end: pxy.clone().add(scaledDistance),
            cursorPos: cursorPos.clone(),
            direction: tempDirection.clone(),
            distance: scale,
            vector: scaledDistance.clone(),
        };
    }

    fire(pointer) { }

    fireRayAttack(data) {
        const groups = this.scene.attackableGroups;
        const end = data.start.clone().add(data.vector);
        const hits = [];
        const ray = new Phaser.Geom.Line(data.start.x, data.start.y, end.x, end.y);
        const polygon = this.polygonRay(data, 20);

        // this.scene.graphics = this.scene.add.graphics();
        // this.scene.graphics.clear();
        // this.scene.graphics.lineStyle(2, 0xff0000);

        // this.scene.graphics.lineStyle(1, 0x00ff00);
        // this.scene.graphics.strokeLineShape(ray);

        groups.forEach(({ group, handler }) => {
            group.getChildren().forEach(target => {
                // find end of weapon to target box
                const bounds = target.getBounds();
                const closestPoint = getClosestPointOnRect(bounds, data.start);
                const toTarget = closestPoint.clone().subtract(data.start);
                const distanceToTarget = toTarget.length();

                // skip far targets
                if (distanceToTarget > data.distance) return;

                // skip out of cone targets
                const dot = data.direction.clone().dot(toTarget.normalize());
                if (dot < 0.85 && dot !== 0) return;

                // line trace
                if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, polygon)) {
                    console.log(target.texture)

                    hits.push(target);
                    this[handler]?.(target);
                    // this.scene.graphics.fillStyle(0x00ff00, 0.5);
                    // this.scene.graphics.fillRectShape(target.getBounds());
                }
            });
        });
        return hits;
    }

    platformHit(plat) {
        console.log('plathit')
        if (this.isProjectile) {
            this.destroy();
        };
    }

    enemyHit(target) {
        if (!this.canHit(target)) return;

        if (target.TakeDamage(this.player, this.baseDamage, this.getKnockBack(target))) {
            this.playHitSound();
        }
    }

    itemHit(target) {
        if (!this.canHit(target)) return;

        target.hit?.(this.player, this.baseDamage, this.getKnockBack(target));
    }

    bulletHit(target) {
        if (!this.canHit(target)) return;

        target.hit?.(this, target);
        this.playHitSound();
        target.destroy();
    }

    canHit(target) {
        if (this.hitTargets.find(t => t === target)) return false;

        this.hitTargets.push(target);
        return true;
    }

    clearHits() {
        this.hitTargets = [];
    }

    getKnockBack(target, direction) {
        if (direction) {
            return direction.clone().scale(this.knockStrength);
        } else {
            const dir = new Phaser.Math.Vector2(target.x - this.player.x, target.y - this.player.y)
            return dir.normalize().scale(this.knockStrength);
        }
    }

    playThrowSound() {
        if (this.scene && this.scene.sound.get(this.throwSound)) {
            this.scene.sound.play(this.throwSound);
        } else {
            scene.sound.add(this.throwSound);
            this.scene.sound.play(this.throwSound);
        }
    }

    playHitSound() {
        if (this.scene && this.scene.sound.get(this.hitSound)) {
            this.scene.sound.play(this.hitSound);
        } else {
            scene.sound.add(this.hitSound);
            this.scene.sound.play(this.hitSound);
        }
    }

    polygonRay(data, thickness) {
        const end = data.start.clone().add(data.vector);

        // Create perpendicular vector to the direction
        const perp = new Phaser.Math.Vector2(-data.direction.y, data.direction.x).scale(thickness / 2);

        // Build a rectangle as a polygon from the start point
        const p1 = data.start.clone().add(perp);
        const p2 = end.clone().add(perp);
        const p3 = end.clone().subtract(perp);
        const p4 = data.start.clone().subtract(perp);

        const rayRect = new Phaser.Geom.Polygon([p1, p2, p3, p4]);
        
        // Debug draw
        // const graphics = this.scene.add.graphics();
        // graphics.lineStyle(1, 0xffff00);
        // graphics.strokePoints(rayRect.points, true);

        return rayRect;
    }
}

function getClosestPointOnRect(rect, point) {
    const x = Phaser.Math.Clamp(point.x, rect.left, rect.right);
    const y = Phaser.Math.Clamp(point.y, rect.top, rect.bottom);
    return new Phaser.Math.Vector2(x, y);
}
