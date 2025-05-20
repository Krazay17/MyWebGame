export default class Projectiles extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene, {allowGravity: false});
    }

    SpawnBullets(x, y, id = 'bullet', amount, speed)
    {
        for (var i = 0; i < amount; i++)
        {
        const bullet = this.create(x, y + (i * 100), id);
        bullet.setVelocityX(speed?? Phaser.Math.Between(-300, -200));
        }
    }

    PlayerHit(player, projectile)
    {
        if(player.TakeDamage(-500, -150))
            projectile.destroy();
    }
}