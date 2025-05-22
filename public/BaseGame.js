import Player from './Player.js';
import PlayerWeapons from './PlayerWeapons.js';
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

    this.playerSpawn(-1100, 300);

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


    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.playerWeapons = new PlayerWeapons(this, this.player);
    this.player.SetWeaponGroup(this.playerWeapons);
    this.pickups = new Pickups(this);

    this.physics.add.collider(this.player, this.platforms, (player, platform) =>{
      this.player.TouchPlatform()
    });

    this.physics.add.collider(this.pickups, this.platforms);

    this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
      this.pickups.Pickup(player, pickup);
    }, null, this);

    this.physics.add.collider(this.playerWeapons, this.platforms, (weapon, plat) => {
      this.playerWeapons.CollideWorld(weapon, plat);
    }, null, this);

    // Spawns
    const platformPositions = [];

    platformPositions.forEach(pos => this.platforms.create(pos[0], pos[1], 'platform'));

    this.showFPS();
  }
  
  restart()
  {
    this.player.UpdateSource(-5);
    this.restart();
  }
  
  update(time, delta)
  {
    this.player.handleInput(delta);
    
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

  playerSpawn(x, y)
  {
    this.player = new Player(this, x, y);
    this.cameras.main.startFollow(this.player, false, .01, .01);
  }

  showFPS()
  {
    this.fpsText = this.add.text(0, 0, '', { font: '24px Courier' });
    this.fpsText.setScrollFactor(0);
    this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
            this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        }
    });
  }
}