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

    playerCollide(enemy, player) {
        const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y);
        const knockback = direction.normalize().scale(600);
        
        player.TakeDamage(knockback.x, knockback.y, 5);
    }
}