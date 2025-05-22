export default class Weapon extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, id = 'shurikan', player, damage)
    {
        super(scene, x, y, id );
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene.sound.add('shurikanthrow');
        this.scene.sound.add('shurikanhit');

        this.baseDamage = damage;
    }

    CollideBullet(bullet)
    {
        bullet.destroy();

        if (this.scene.sound.get('shurikanhit'))
        this.scene.sound.play('shurikanhit');

        this.destroy();
    }

    CollideWorld(plat)
    {
        this.destroy();
    }

    EnemyHit(enemy)
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