import Player from './Player.js';
import Enemies from './Enemies.js';
import PlayerProjectiles from './PlayerProjectiles.js';
import Projectiles from './Projectiles.js';
import Pickups from './Pickups.js';
import NetworkManager from './NetworkManager.js';

export default class BaseGame extends Phaser.Scene
{
  constructor (key)
  {
    super(key);
  }

  preload()
  {
    this.load.image('platform', 'Assets/platform.png');
    this.load.image('platformwide', 'Assets/platformwide.png');
    this.load.image('platformtall', 'Assets/platformtall.png');
    this.load.image('coin', 'Assets/SourceCoin.png');
    this.load.image('bullet', 'Assets/bullet.png');
    this.load.image('sunman', 'Assets/SunMan.png');
    this.load.image('duckman', 'Assets/duckman.png');
    this.load.image('turret', 'Assets/TurretPlatform.png');
    this.load.image('fireball', 'Assets/Fireball.png');
    this.load.audio('music', 'Assets/Music.wav');
  }

  create()
  {    
    this.physics.world.setBounds(-1600, 0, 3200, 900);
    this.bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(-1600, 0, 3200, 900);
    
    this.network = new NetworkManager(this);
    Object.values(this.network.otherPlayers).forEach(ghost => {
      ghost.updateScene(this);
    });

    this.restartKey = this.input.keyboard.on('keydown-R', () => {
      this.player.Died();
      this.scene.restart();
    });

    this.homeKey = this.input.keyboard.on('keydown-T', () => {
      this.scene.start('Home');
    });

    if (!this.sound.get('music')){
    this.gameMusic = this.sound.add('music', {loop: true});
    this.gameMusic.volume = .35;
    this.gameMusic.play();
    }

    const instructions = this.add.text(16, 48, 'Shift - dash \nR - Reset', {
    fontSize: '32px',
    color: '#4fffff',
    });
    instructions.setScrollFactor(0);

    this.playerSpawn = [0, 0];
    this.player = new Player(this, this.playerSpawn[0], this.playerSpawn[1]);
    this.cameras.main.startFollow(this.player, false, .01, .01);

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.turrets = new Enemies(this, false);
    this.bullets = new Projectiles(this);
    this.playerProjectiles = new PlayerProjectiles(this, this.player);
    this.player.SetProjectileGroup(this.playerProjectiles);
    this.pickups = new Pickups(this);
    this.sunMans = new Enemies(this);

    // Collisions
    this.playerProjectiles.SetupCollisionWithEnemies(this.sunMans);
    this.playerProjectiles.SetupCollisionWithEnemies(this.turrets);

    this.physics.add.collider(this.player, this.platforms, (player, platform) =>{
      this.player.TouchPlatform()
    });

    this.physics.add.collider(this.sunMans, this.sunMans);
    this.physics.add.collider(this.pickups, this.platforms);

    this.physics.add.overlap(this.player, this.sunMans, (player, enemy) =>{
      this.sunMans.PlayerCollide(player, enemy, true);
    });

    this.physics.add.collider(this.player, this.turrets, (player, turret) => {
      this.player.TouchPlatform()
    }, null, this);

    this.physics.add.overlap(this.player, this.bullets, (player, bullet) => {
      this.bullets.PlayerHit(player, bullet);
    }, null, this);

    this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
      this.pickups.Pickup(player, pickup);
    }, null, this);

    this.physics.add.collider(this.playerProjectiles, this.bullets, (projectile, bullet) => {
      this.playerProjectiles.CollideBullet(projectile, bullet);
    }, null, this);

    this.physics.add.collider(this.playerProjectiles, this.platforms, (projectile, plat) => {
      this.playerProjectiles.CollideWorld(projectile, plat);
    }, null, this);

    // Spawns
    const platformPositions = [];

    platformPositions.forEach(pos => this.platforms.create(pos[0], pos[1], 'platform'));

    this.sunMans.SpawnSunMan(1900, 0);
    this.sunMans.SpawnSunMan(2000, 400);
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 10000),
      callback: () => {
        if (this.sunMans.countActive() < 4)
        this.sunMans.SpawnSunMan(1900, 0)
      },
      loop: true
    });



    this.turrets.SpawnTurret(1400, 100);

    this.bullets.SpawnBullets(1900, 50, 8);
    this.time.addEvent({
      delay: 3000,
      callback: () => this.bullets.SpawnBullets(1900, 50, 8),
      loop: true
    });

    this.turrets.getChildren().forEach(turret => {
        this.bullets.SpawnFireballs(turret.body.x, turret.body.y + 40)});
    this.time.addEvent({
      delay: 1000,
      callback: () => this.turrets.getChildren().forEach(turret => {
        this.bullets.SpawnFireballs(turret.body.x, turret.body.y + 40)}),
      loop: true
    });

  }
  
  restart()
  {
    this.player.UpdateSource(-5);
    this.restart();
  }
  
  update(time, delta)
  {

    this.player.handleInput(delta);

    this.platforms.getChildren().forEach(platform => {
      if (platform.body.y > this.physics.world.bounds.height)
        platform.body.y = 0 - platform.body.height;
    });

    this.bullets.getChildren().forEach(child => {
      const { x, y } = child.body;

      if (
          x < this.bounds.x - 600 || x > this.bounds.right + 600 ||
          y < this.bounds.y - 600 || y > this.bounds.bottom + 600
      ) {
          child.destroy();
        }
    });
    
    this.network.socket.emit('playerMove', {
      x: this.player.x,
      y: this.player.y
    });
  }

  MakeSky(a = 'sky', b = 'skylayer1', c = 'skylayer2')
  {
    this.sky1 = this.add.image(0, 0, a).setOrigin(0)
    .setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0)
    .on('resize', (gameSize) =>{
      const width = gameSize.width;
      const height = gameSize.height;

      this.sky1.setDisplaySize(width, height);
    });
    this.sky2 = this.add.image(600, 0, b).setScale(.5).setScrollFactor(.2)
    this.sky3 = this.add.image(600, 0, c).setScale(.5).setScrollFactor(.6)
  }
}