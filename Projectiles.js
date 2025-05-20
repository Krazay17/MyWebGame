export default class Projectiles extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene, {allowGravity: false});
    }

    SpawnBullets(id = 'bullet', amount, x, y, speed)
    {
        for (var i = 0; i < amount; i++)
        {
        const bullet = this.create(x, y + (i * 100), id);
        bullet.setVelocityX(Phaser.Math.Between(-200, -300));
        bullet.body.checkCollision.up = false;
        }
    }

    PlayerHit(player, projectile)
    {
        if(player.TakeDamage(-500, -150))
            projectile.destroy();
    }
}