import Player from './Player.js';
import Enemies from './Enemies.js'
import PlayerProjectiles from './PlayerProjectiles.js';
import Projectiles from './Projectiles.js';

export default class MainGame extends Phaser.Scene
{
  constructor ()
  {
    super('MainGame');
  }

  preload()
  {
    this.load.image('platform', 'Assets/platform.png');
    this.load.image('platformwide', 'Assets/platformwide.png');
    this.load.image('platformtall', 'Assets/platformtall.png');
    this.load.image('coin', 'Assets/SourceCoin.png');
    this.load.image('bullet', 'Assets/bullet.png');
    this.load.image('sunMan', 'Assets/SunMan.png');
    this.load.image('turret', 'Assets/TurretPlatform.png');
    this.load.image('fireball', 'Assets/Fireball.png');
    this.load.audio('pickup', 'Assets/SuccessBeep.wav');
    this.load.audio('music', 'Assets/Music.wav');
  }

  create()
  {
    this.add.image(600, 300, 'sky').setScale(.3).setScrollFactor(0);
    this.add.image(600, 150, 'skylayer1').setScale(.4).setScrollFactor(.6);
    this.add.image(600, 300, 'skylayer2').setScale(.35).setScrollFactor(.2);
    this.physics.world.setBounds(-1400, 0, 2800, 900);
    this.cameras.main.setBounds(-1600, 0, 3200, 900);

    this.restartKey = this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    })

    if (!this.sound.get('music')){
    this.gameMusic = this.sound.add('music', {loop: true});
    this.gameMusic.volume = .3;
    this.gameMusic.play();
    }

    const instructions = this.add.text(16, 48, 'Shift - dash \nR - Reset', {
    fontSize: '32px',
    color: '#4fffff',
    });
    instructions.setScrollFactor(0);

    this.player = new Player(this, -1100, 600);

    this.cameras.main.startFollow(this.player, false, .01, .01);

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.turrets = new Enemies(this);
    this.bullets = new Projectiles(this);
    this.playerProjectiles = new PlayerProjectiles(this);
    this.player.SetProjectileGroup(this.playerProjectiles);

    // Collisions
    this.physics.add.collider(this.player, this.platforms, (player, platform) =>{
      this.player.TouchPlatform()
    });

    this.physics.add.collider(this.player, this.turrets, (player, turret) => {
      this.player.CarryPlayer(player, turret);
    }, null, this);

    this.physics.add.overlap(this.player, this.bullets, (player, bullet) => {
      this.bullets.PlayerHit(player, bullet);
    }, null, this);

    this.physics.add.collider(this.playerProjectiles, this.bullets, (pp, bullet) => {
      this.playerProjectiles.CollideBullet(pp, bullet);
    }, null, this);

    this.physics.add.collider(this.playerProjectiles, this.platforms, (pp, plat) => {
      this.playerProjectiles.CollideWorld(pp, plat);
    }, null, this);

    // Spawns
    const platformPositions = [
                    [-900, 300],                                        [-150, 100], [100, 200], [300, 100],             [700, 450], [900, 700], [1100, 700],
                    [-900, 500],                           [-300, 350], [-100, 225],             [300, 600],             [600, 550],             [1100, 700],
      [-1100, 700], [-900, 700],                           [-300, 700], [-100, 700], [100, 800], [300, 850], [500, 700], [700, 700], [900, 700], [1100, 700],
    ];

    const turretPositions = [[1400, 100]];

    platformPositions.forEach(pos => this.platforms.create(pos[0], pos[1], 'platform'));
    
    turretPositions.forEach(pos => {
      this.turrets.SpawnTurret(pos[0], pos[1], 'turret')
      });

    this.bullets.SpawnBullets(1400, 100, 'bullet', 8);
    this.time.addEvent({
      delay: 3000,
      callback: () => this.bullets.SpawnBullets(1400, 100, 'bullet', 8),
      loop: true
    });

    this.turrets.getChildren().forEach(turret => {
        this.bullets.SpawnBullets(turret.body.x, turret.body.y + 40, 'fireball', 1,  -500)});
    this.time.addEvent({
      delay: 1000,
      callback: () => this.turrets.getChildren().forEach(turret => {
        this.bullets.SpawnBullets(turret.body.x, turret.body.y + 40, 'fireball', 1, -500)}),
      loop: true
    });

  }
  
  update()
  {
    const time = this.time.now;

    this.player.handleInput(this.game.loop.delta);
    
    // this.turrets.getChildren().forEach(t => {
    //   t.y = t.originalY + Math.sin(this.time.now * 0.00025) * 300;
    // });

  }

}