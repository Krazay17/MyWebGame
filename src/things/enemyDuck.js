import BaseEnemy from "./_baseEnemy.js";

export default class Duck extends BaseEnemy
{
    constructor(scene, x, y, id = 'duck', health)
    {
        super(scene, x, y, id);
        this.maxHealth = health;
        this.health = health;
        this.doesWalk = true;

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        //this.handleMovement(time);
    }

    playerCollide(player, enemy) {
        const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y);
        const knockback = direction.normalize().scale(600);
        
        player.TakeDamage(knockback.x, knockback.y, 5);
    }
}