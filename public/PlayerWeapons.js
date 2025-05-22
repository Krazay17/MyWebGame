import Weapon from './Weapon.js';

export default class PlayerWeapons extends Phaser.Physics.Arcade.Group
{
    constructor (scene, player)
    {
        super(scene.physics.world, scene, {allowGravity: false});
        this.player = player;

    }

    SpawnShurikan(x, y, direction)
    {
        const speed = 1000;
        const velocity = direction.scale(speed);

        const projectile = new Weapon(this.scene, x, y, 'shurikan', this.player, 1, true);
        this.add(projectile);
        projectile.setScale(.15);
        projectile.setVelocity(velocity.x, velocity.y);

        this.scene.tweens.add({
            targets: projectile,
            angle: 360,
            duration: 500,
            repeat: -1,
            ease: 'Linear',
        });

        this.scene.time.addEvent({
            delay: 550,
            callback: () => projectile.destroy()
        });
        
        if (!this.scene.sound.get('shurikanthrow')){
            this.scene.sound.add('shurikanthrow');
            this.scene.sound.play('shurikanthrow');
        } else {
            this.scene.sound.play('shurikanthrow');
        }
        if (!this.scene.sound.get('shurikanhit'))
            this.scene.sound.add('shurikanhit');
    }

    SpawnSword(x, y, direction)
    {
        const sword = new Weapon(this.scene, x, y, 'sword')
        this.add(sword);

    }
}