export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, id = 'duckman', health, showHealthBar = false)
    {
        super(scene, x, y, id);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.maxHealth = health;
        this.health = health;
        this.canDamage = true;
        this.createdHealthBar = false;

        if (showHealthBar){
            this.createHealthBar();
        }
    }

    createHealthBar()
    {
        this.createdHealthBar = true;
        const barWidth = this.maxHealth * 10;
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.height / 2 - 6, barWidth, 6, 0x000000, 0.6);
        this.healthBar = this.scene.add.rectangle(this.x, this.y - this.height / 2 - 6, barWidth, 6, 0xff0000, 1);
        this.healthBar.setOrigin(0.5);
        this.healthBarBg.setOrigin(0.5);
    }

    updateHealthBar()
    {
        if (!this.healthBar) return;

        const percent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
        this.healthBar.width = this.maxHealth * 10 * percent;

        // Positioning
        this.healthBar.x = this.x;
        this.healthBar.y = this.y - this.height / 2 - 6;
        this.healthBarBg.x = this.x;
        this.healthBarBg.y = this.y - this.height / 2 - 6;
    }

    TakeDamage(player, amount, velocity)
    {
        if (!this.canDamage) return false;
        if (!this.createdHealthBar) this.createHealthBar();

        this.health -= amount;
        this.updateHealthBar();

        if (this.health <= 0) {
            this.die(player);
        } else {
            const prevVelocity = this.body.velocity.clone();
            this.setVelocity(velocity.x/3, velocity.y/3)
            this.scene.time.addEvent({
                delay: 200,
                callback: () => {this.setVelocity(prevVelocity.x, prevVelocity.y); console.log('regain velocity!')}
            });
        }
        return true;
    }

    die(player)
    {
        player.UpdateSource(this.maxHealth);
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        this.destroy();
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
        this.updateHealthBar();
    }

    // Extendable methods:
    onPlayerCollide(player)
    {
        player.TakeDamage(-400, -150); // or something based on velocity
    }

}