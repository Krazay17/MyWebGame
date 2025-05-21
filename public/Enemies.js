import Enemy from './Enemy.js';

export default class Enemies extends Phaser.Physics.Arcade.Group
{
    constructor(scene, GravityOn = true)
    {
        super(scene.physics.world, scene, {allowGravity: GravityOn, immovable: true});
    }

    SpawnTurret(x, y)
    {
      const turret = new Enemy(this.scene, x, y, 'turret', 6, false);
      this.add(turret, true);
      turret.setVelocityY(50);
      turret.setBounce(1);
      turret.setCollideWorldBounds(true);

      // this.scene.tweens.add({
      //   targets: turret,
      //   y: this.scene.physics.world.bounds.height - turret.height / 2,
      //   duration: 8000,
      //   yoyo: true,
      //   repeat: -1,
      //   onUpdate: () => {
      //     turret.body?.updateFromGameObject(); // Keep physics body in sync
      //   }
      // });

      // bind to the turrets die function to respawn 5 seconds after death
      const originalDie = turret.die.bind(turret);
      turret.die = (player) =>{
        originalDie(player);

        this.scene.time.addEvent({
          delay: 5000,
          callback: () => this.SpawnTurret(x, y)
        });
      };
    }

    SpawnSunMan(x, y)
    {
      const sunMan = new Enemy(this.scene, x, y, 'sunman', 3);
      this.add(sunMan, true);
      sunMan.setBounce(1);
      sunMan.setCollideWorldBounds(true);
      sunMan.setVelocityX(-200);
    }

    PlayerCollide(player, enemy, velocity)
    {
      const knockX = velocity? enemy.body.velocity.x * 1.5 : -400;
      const knockY = velocity? enemy.body.velocity.y * 1.5 : -100;
      player.TakeDamage(knockX, knockY, 1);
    }
}
