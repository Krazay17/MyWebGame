export default class Weapon extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, id = 'shurikan', player, damage, projectile = false)
    {
        super(scene, x, y, id );
        this.scene = scene;

        this.player = player;
        this.baseDamage = damage;
        this.isProjectile = projectile;

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    BulletHit(bullet)
    {
        bullet.destroy();

        if (this.scene.sound.get('shurikanhit'))
            this.scene.sound.play('shurikanhit');

        this.destroy();
    }

    PlatformHit(plat)
    {
        if(this.isProjectile){
            this.destroy();
        };
    }

    EnemyHit(enemy)
    {
        if (this.scene && this.scene.sound.get('shurikanhit'))
            this.scene.sound.play('shurikanhit');

        if (this.isProjectile){
            const Velocity = this.body.velocity;
            if (enemy.TakeDamage(this.player, this.baseDamage, Velocity))
                this.destroy();
        };
    }

    BreakableHit(target)
    {
        // Stuff
        target.Hit(this.player, this.baseDamage);
        // Destroy
        if (this.isProjectile){
            this.destroy();
        };
    }
}