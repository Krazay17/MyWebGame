export default class PlayerProjectiles extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene, {allowGravity: false});
    }

    SpawnProjectile(x, y, id = 'shurikan', direction)
    {
        const speed = 1000;

        const velocity = direction.scale(speed);
        const projectile = this.create(x, y, id);
        projectile.setScale(.15);
        projectile.setVelocity(velocity.x, velocity.y);
        this.scene.tweens.add({
            targets: projectile,
            angle: 360,
            duration: 500,
            repeat: -1
        });
        this.scene.time.addEvent({
            delay: 550,
            callback: () => projectile.destroy()
        })
    }

    CollideBullet(pp, bullet)
    {
        pp.destroy();
        bullet.destroy()
    }

    CollideWorld(pp, plat)
    {
        console.log('HITWORLD');
        pp.destroy();
    }
}