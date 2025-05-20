export default class PlayerProjectiles extends Phaser.Physics.Arcade.Group
{
    constructor (scene, player, damage)
    {
        super(scene.physics.world, scene, {allowGravity: false});
        this.player = player;

        this.scene.sound.add('shurikanthrow');
        this.scene.sound.add('shurikanhit');

        this.baseDamage = damage;
    }

    SpawnShurikan(x, y, direction)
    {
        const speed = 1000;
        const velocity = direction.scale(speed);

        const projectile = this.create(x, y, 'shurikan');
        projectile.setScale(.15);
        projectile.setVelocity(velocity.x, velocity.y);

        projectile.damage = 1;

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
        
        if (this.scene.sound.get('shurikanthrow'))
        this.scene.sound.play('shurikanthrow');
    }

    CollideBullet(projectile, bullet)
    {
        projectile.destroy();
        bullet.destroy()

        if (this.scene.sound.get('shurikanhit'))
        this.scene.sound.play('shurikanhit');
    }

    CollideWorld(projectile, plat)
    {
        projectile.destroy();
    }

    EnemyHit(projectile, enemy)
    {
        const Velocity = projectile.body.velocity;
        if (enemy.TakeDamage(this.player, projectile.damage, Velocity))
            projectile.destroy();

        if (this.scene.sound.get('shurikanhit'))
        this.scene.sound.play('shurikanhit');
    }

    SetupCollisionWithEnemies(enemyGroup)
    {
        this.scene.physics.add.overlap(this, enemyGroup, this.EnemyHit, null, this);
    }
}