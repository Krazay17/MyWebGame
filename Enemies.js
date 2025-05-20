export default class Enemies extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene, {immovable: true, allowGravity: false});
    }

    SpawnTurret(x, y, id = 'turret')
    {
      const turret = this.create(x, y, id);

        this.scene.tweens.add({
          targets: turret,
          y: this.scene.physics.world.bounds.height - turret.height / 2,
          duration: 8000,
          yoyo: true,
          repeat: -1,
          onUpdate: () => {
            turret.body?.updateFromGameObject(); // Keep physics body in sync
          }
        });
        
    }
}