import BaseGame from './_basegame.js';

export default class Level1 extends BaseGame {
  constructor() {
    super('Level1');
  }

  preload() {
    super.preload();
    this.load.image('sky', 'assets/RedGalaxy2.png');
    this.load.image('skylayer1', 'assets/SkyLayer1.png');
    this.load.image('skylayer2', 'assets/SkyLayer2.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('sunsheet', 'assets/SunSheet.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    this.load.image('duckman', 'assets/duckman.png');
    this.load.image('turret', 'assets/TurretPlatform.png');
    this.load.spritesheet('fireballsheet', 'assets/FireballSheet.png', {
      frameWidth: 66,
      frameHeight: 26
    });
    this.load.audio('music', 'assets/Music.wav');
  }

  create() {
    this.setupSave();
    this.setupSky('sky', { x: 0, y: 0 }, 'skylayer2', { x: 600, y: 0 }, 'skylayer1', { x: 600, y: 0 });
    this.setupWorld();
    this.setupKeybinds();
    this.setupMusic('music');
    this.setupFPS();
    this.setupPlayer(-1100, 300);

    this.setupGroups();

    this.setupCollisions();


    // this.physics.add.collider(this.player, this.turrets, (player, turret) => {
    //   this.player.TouchPlatform()
    // }, null, this);

    // Spawns
    const moveingPlatformPos = [
      [-1100,], [-900, 150], [-400, 100], [-200,], [-150, 50], [100,], [300,], [700,], [900,], [1100,],
      [-900, 300], [-600, 200], [-150, 300], [100, 200], [300, 100], [700, 450], [900, 200], [1100, 100],
      [-900, 500], [-300, 350], [-100, 225], [300, 600], [600, 550], [1000, 500], [1100, 300],
      [-1100, 400], [-900, 700], [-500, 800], [-300, 700], [-100, 700], [100, 800], [300, 850], [500, 700], [700, 700], [900, 700], [1100, 700],
    ];

    moveingPlatformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform')
  .setVelocityY(20));

    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: () => {
        if (this.itemGroup.countActive() < 9)
        this.spawnManager.SpawnCoin(Phaser.Math.Between(-1100, 1100), 0);
      },
      loop: true
    });

    this.spawnManager.spawnSunMans(1900, 0);
    this.spawnManager.spawnSunMans(2000, 400);
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 10000),
      callback: () => {
        if (this.softEnemyGroup.countActive() < 4)
          this.spawnManager.spawnSunMans(1900, 0)
      },
      loop: true
    });

    this.spawnManager.spawnBullets(1900, 50, 8);
    this.time.addEvent({
      delay: 3000,
      callback: () => this.spawnManager.spawnBullets(1900, 50, 8),
      loop: true
    });

    this.turrets = [this.spawnManager.spawnTurret(1400, 100)];

    this.turrets.forEach(turret => {
      this.spawnManager.spawnFireballs(turret.body.x, turret.body.y + 40)
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => this.turrets.forEach(turret => {
        if (turret.body) this.spawnManager.spawnFireballs(turret.body.x, turret.body.y + 40);
      }),
      loop: true
    });

  }

  update(time, delta) {
    super.update(time, delta);
    this.walkableGroup.getChildren().forEach(platform => {
      if (platform.body.y > this.physics.world.bounds.height)
        platform.body.y = 0 - platform.body.height;
    });

    // this.bullets.getChildren().forEach(child => {
    //   const { x, y } = child.body;

    //   if (
    //       x < this.bounds.x - 600 || x > this.bounds.right + 600 ||
    //       y < this.bounds.y - 600 || y > this.bounds.bottom + 600
    //   ) {
    //       child.destroy();
    //     }
    // });

  }
}