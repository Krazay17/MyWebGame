export default class Projectiles extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene, {allowGravity: false});
    }

    SpawnBullets(x, y, amount)
    {
        for (var i = 0; i < amount; i++)
        {
        const bullet = this.create(x, y + (i * 100), 'bullet');
        bullet.setVelocityX(Phaser.Math.Between(-300, -200));
        }
    }
    SpawnFireballs(x, y)
    {
        const bullet = this.create(x, y, 'fireballsheet');
        bullet.setVelocityX(-450);
        if (!this.scene.anims.get('fireball'))
            this.scene.anims.create({
                key: 'fireball',
                frames: this.scene.anims.generateFrameNumbers('fireballsheet', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
        });
        bullet.play('fireball');
    }

    PlayerHit(player, projectile)
    {
        if(player.TakeDamage(-500, -150))
            projectile.destroy();
    }
}