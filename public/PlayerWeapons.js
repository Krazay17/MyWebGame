import Weapon from './Weapon.js';

export default class PlayerWeapons extends Phaser.Physics.Arcade.Group
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

        const projectile = new Weapon(this.scene, x, y, 'shurikan');
        this.add(projectile);
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

    SpawnSword(x, y, direction)
    {
        const sword = new Weapon(this.scene, x, y, )
    }

    EnemyHit(weapon, enemy)
    {
        const Velocity = weapon.body.velocity;
        if (enemy.TakeDamage(this.player, weapon.damage, Velocity))
            weapon.destroy();

        if (this.scene.sound.get('shurikanhit'))
        this.scene.sound.play('shurikanhit');
    }

    SetupCollisionWithEnemies(enemyGroup)
    {
        this.scene.physics.add.overlap(this, enemyGroup, this.EnemyHit, null, this);
    }
}