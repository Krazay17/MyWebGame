import BaseEnemy from "./_baseEnemy.js";

export default class Duck extends BaseEnemy
{
    constructor(scene, x, y, id = 'duckman', spawnManager, health, showHealthBar = false, doesWalk = false)
    {
        super(scene, x, y, id, spawnManager, health, showHealthBar, doesWalk);
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
    }

    playerCollide(player, enemy) {
        const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y);
        const knockback = direction.normalize().scale(600);
        
        player.TakeDamage(knockback.x, knockback.y, 5);
    }
}