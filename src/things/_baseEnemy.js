export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id = 'duck', health = 1) {
        super(scene, x, y, id);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.doesWalk = false;
        this.maxHealth = health;
        this.health = health;
        this.canDamage = true;
        this.createdHealthBar = false;
        this.alive = true;
        this.hitRecover = undefined;
        this.velocityKnock = false;
        this.knockPower = 500;

        // Behavior config
        this.speed = 150;
        this.jumpPower = 550;
        this.stuckJumpCooldown = 1000; // ms cooldown between stuck jumps
        this.edgeLookaheadDistance = 10; // pixels to check for platform edges

        // Internal state
        this.state = 'idle';  // 'idle', 'walking', 'jumping', 'falling'
        this.hasJumpedFromStuck = false;
        this.lastJumpTime = 0;

        this.scene.events.on('update', this.currentSpeed, this)

        if (this.anims.get(id))
            this.play(id);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.alive) return;
        this.updateHealthBar();
        this.currentSpeed();
        this.locoAnims();
    }

    createHealthBar() {
        this.createdHealthBar = true;
        this.healthBarWidth = Phaser.Math.Clamp(this.maxHealth * 8, 16, 128);
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.displayHeight / 2 - 6, this.healthBarWidth, 6, 0x000000, 0.6);
        this.healthBar = this.scene.add.rectangle(this.x, this.y - this.displayHeight / 2 - 6, this.healthBarWidth, 6, 0xff0000, 1);
        this.healthBar.setOrigin(0.5);
        this.healthBarBg.setOrigin(0.5);
    }

    updateHealthBar() {
        if (!this.healthBar) return;

        const percent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
        this.healthBar.setScale(percent, 1);

        // Positioning
        this.healthBar.x = this.x;
        this.healthBar.y = this.y - this.displayHeight / 2 - 6;
        this.healthBarBg.x = this.x;
        this.healthBarBg.y = this.y - this.displayHeight / 2 - 6;
    }

    TakeDamage(player, amount, velocity) {
        if (!this.canDamage) return false;
        if (!this.createdHealthBar) this.createHealthBar();

        this.health -= amount;
        this.updateHealthBar();

        if (this.health <= 0) {
            this.alive = false;
            this.scene.time.removeEvent(this.hitRecover);
            this.die(player);
        } else {
            this.stunned = true;
            const prevVelocity = this.body.velocity.clone();
            this.setVelocity(velocity.x / 3, velocity.y / 3)
            this.setTint(0xff0000);
            this.hitRecover = this.scene.time.addEvent({
                delay: 200,
                callback: () => {
                    if (this.alive) {
                        this.stunned = false;
                        this.setVelocity(prevVelocity.x, prevVelocity.y);
                        this.setTint();
                    }
                }
            });
        }
        return true;
    }

    die(player) {
        player.updateSource(this.maxHealth);
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        this.destroy();
    }


    playerCollide(player, enemy) {
        const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y);
        const knockback = direction.normalize().scale(this.knockPower);

        player.TakeDamage(knockback.x, knockback.y, 1);
    }

    scaleCollision(x, y) {
        this.body.setSize(x, y); // Smaller than sprite size
        this.body.setOffset(
            (this.width - x) / 2,
            (this.height - y) / 2
        );
    }

    currentSpeed(time, delta) {
        if (!this.prevPos) {
            this.prevPos = new Phaser.Math.Vector2(this.x, this.y);
            this.realSpeed = 0;
            return;
        }

        const currentPos = new Phaser.Math.Vector2(this.x, this.y);
        const deltaPos = currentPos.clone().subtract(this.prevPos);
        const dist = deltaPos.length();

        // Only update realSpeed if it actually moved
        if (dist > 0.01) {
            this.realSpeed = dist / (delta / 1000); // pixels per second
            this.prevPos.copy(currentPos);
            this.movementDirection = deltaPos;
        }
    }

    handleMovement(time) {
        // if (!this.body.blocked.down) {
        //     // In air
        //     this.state = this.body.velocity.y > 0 ? 'falling' : 'jumping';
        //     return;
        // }

        if (this.stunned) return;

        this.state = 'walking';

        // Simple AI: move toward player
        const player = this.scene.player;
        if (!player) return;

        const directionX = Math.sign(player.x - this.x);
        const directionY = Math.sign(player.y - this.y);
        const distance = { x: Math.abs(this.x - player.x), y: Math.abs(this.y - player.y) };
        const distanceScaled = this.mapRangeClamped(distance.x, 0, 100, 0, 1)
        this.setVelocityX(directionX * this.speed * distanceScaled);
        if (this.flying) {
            this.setVelocityY(directionY * this.speed * distanceScaled);
        }

        // Edge detection: cast a point ahead and down to check if ground is there
        const edgeX = this.x + directionX * this.edgeLookaheadDistance;
        const edgeY = this.y + this.height / 2 + 2;

        const tileBelow = this.scene.groundLayer ? this.scene.groundLayer.getTileAtWorldXY(edgeX, edgeY) : null;

        // const noGroundAhead = !tileBelow;
        const noGroundAhead = false;

        // Wall stuck detection
        const stuckAgainstWall = this.body.touching.left || this.body.touching.right;
        const nearlyZeroVelocityX = Math.abs(this.body.velocity.x) < 10;

        // Should jump if stuck or edge ahead and cooldown elapsed
        const canJump = (time - this.lastJumpTime) > this.stuckJumpCooldown;

        if ((stuckAgainstWall || nearlyZeroVelocityX && this.body.touching.down) || noGroundAhead) {
            if (canJump) {
                this.setVelocityY(-this.jumpPower);
                this.lastJumpTime = time;
            } else {
                // Prevent moving forward if edge or wall detected but can't jump yet
                this.setVelocityX(0);
            }
        }
    }

    locoAnims() {
        if (!this.movementDirection) return;
        if (this.movementDirection.x > 0) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }
    }

    mapRangeClamped(value, inMin, inMax, outMin, outMax) {
        if (inMin === inMax) return outMin; // Avoid divide by zero

        // Normalize input range to 0–1
        let t = (value - inMin) / (inMax - inMin);

        // Clamp the normalized value
        t = Math.max(0, Math.min(1, t));

        // Remap to output range
        return outMin + (outMax - outMin) * t;
    }

    getCurrentPos() {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

}