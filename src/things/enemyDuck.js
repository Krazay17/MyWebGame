import BaseEnemy from "./_baseEnemy.js";

export default class Duck extends BaseEnemy
{
    constructor(scene, x, y, health)
    {
        super(scene, x, y, 'duck');
        this.maxHealth = health;
        this.health = health;
        
        this.body.setBounce(.7);
        this.setScale(.3);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.patrol(time);
        this.chasePlayer(time);
    }

    playerCollide(player) {
        const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y);
        const knockback = direction.normalize().scale(600);
        
        player.TakeDamage(knockback.x, knockback.y, 5);
    }

    respawn() {
        const spawnX = this.x;
        const spawnY = this.y;
                this.once('die', () => {
            const checkDistanceTimer = this.scene.time.addEvent({
                delay: 1000, // check every 1 second (adjust if you want)
                callback: () => {
                    const dx = this.scene.player.x - x;
                    const dy = this.scene.player.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 800) {
                        console.log('Respawning duck');
                        this.activate();
                        this.setPosition(spawnX, spawnY);
                        checkDistanceTimer.remove(); // stop checking
                    }
                },
                loop: true
            });

        });
    }
}