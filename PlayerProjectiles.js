export default class PlayerProjectiles extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene, {allowGravity: false});
    }

    SpawnShurikan(x, y, direction)
    {
        const speed = 1000;

        const velocity = direction.scale(speed);
        const projectile = this.create(x, y, 'shurikan');
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
        });

        this.scene.sound.play('shurikanthrow');
    }

    CollideBullet(pp, bullet)
    {
        pp.destroy();
        bullet.destroy()

        this.scene.sound.play('shurikanhit');
    }

    CollideWorld(pp, plat)
    {
        pp.destroy();

        this.scene.sound.play('shurikanhit');
    }
}