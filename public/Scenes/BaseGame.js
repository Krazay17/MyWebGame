import Player from '../Player.js';
import WeaponGroup from '../Weapons/WeaponGroup.js';
import Pickups from '../Pickups.js';
import NetworkManager from '../NetworkManager.js';
import GameManager from '../GameManager.js';
import Breakables from '../Breakables.js';

export default class BaseGame extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.key = key;

  }

  preload() {
    this.load.audio('energysound', 'Assets/EnergySound.wav');
    this.load.image('platform', 'Assets/platform.png');
    this.load.image('platformwide', 'Assets/platformwide.png');
    this.load.image('platformtall', 'Assets/platformtall.png');
    this.load.spritesheet('dudesheet', 'Assets/DudeSheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    
    this.load.spritesheet('boxsheet', 'Assets/BoxSheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  update(time, delta) {
    if (this.player) this.player.handleInput(delta);

    if (this.network) {
      this.network.socket.emit('playerMove', {
        x: this.player.x,
        y: this.player.y
      });
    }
  }

  setupWorld() {
    this.physics.world.setBounds(-1600, 0, 3200, 900);
    this.bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(-1600, 0, 3200, 900);

    this.network = new NetworkManager(this);

    Object.values(this.network.otherPlayers).forEach(ghost => {
      ghost.updateScene(this);
    });
  }

  setupSky(a = 'sky2', b = 'sky2layer1', c = 'sky2layer2') {
    this.sky1 = this.add.image(0, 0, a).setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0)
      .on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;

        this.sky1.setDisplaySize(width, height);
      });
    this.sky2 = this.add.image(800, 600, b).setScale(.5).setScrollFactor(.2)
    this.sky3 = this.add.image(600, 400, c).setScale(.5).setScrollFactor(.6)
  }

  setupPlayer(x = 0, y = 0) {
    this.player = new Player(this, x, y);
    this.cameras.main.startFollow(this.player, false, .01, .01);
  }

  setupFPS() {
    this.fpsText = this.add.text(0, 0, '', { font: '24px Courier' });
    this.fpsText.setScrollFactor(0);
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
      }
    });

    const instructions = this.add.text(16, 48, 'Shift - dash \nR - Reset', {
      fontSize: '32px',
      color: '#4fffff',
    });
    instructions.setScrollFactor(0);
  }

  setupGroups() {
    this.platformGroups = [];
    this.enemyGroups = [];
    this.bulletGroups = [];
    this.breakableGroups = [];
    // Groups
    this.platformGroups.push(this.platforms = this.physics.add.staticGroup());
    this.pickups = new Pickups(this);
    this.playerWeapons = new WeaponGroup(this, this.player);
    this.breakableGroups.push(this.breakables = new Breakables(this));

    this.player.SetWeaponGroup(this.playerWeapons);
  }

  setupCollisions() {
    this.enemyGroups.forEach(group => {
      this.physics.add.overlap(this.playerWeapons, group, (weapon, enemy) => {
        weapon.EnemyHit(enemy);
      }, null, this);
    });

    this.platformGroups.forEach(group => {
      this.physics.add.overlap(this.playerWeapons, group, (weapon, platform) => {
        weapon.PlatformHit(platform);
      }, null, this);
    });

    this.bulletGroups.forEach(group => {
      this.physics.add.overlap(this.playerWeapons, group, (weapon, bullet) => {
        weapon.BulletHit(bullet);
      }, null, this);
    });

    this.breakableGroups.forEach(group => {
      this.physics.add.overlap(this.playerWeapons, group, (weapon, target) => {
        weapon.BreakableHit(target);
      }, null, this);
    });

    this.physics.add.collider(this.player, this.breakables, (player, platform) => {
      this.player.TouchPlatform()
    });

    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
      this.player.TouchPlatform()
    });

    this.physics.add.collider(this.pickups, this.platforms);

    this.physics.add.overlap(this.player, this.pickups, (player, pickup) => {
      this.pickups.Pickup(player, pickup);
    }, null, this);
  }

  setupKeybinds() {
    this.restartKey = this.input.keyboard.on('keydown-R', () => {
      this.player.Died();
      this.scene.restart();
    });

  }

  setupMusic(key = 'homemusic', volume = 1) {
    // If music is already playing and it's the same track, do nothing
    // Use globalThis to store music reference
    if (!globalThis.currentMusic || globalThis.currentMusic.key !== key) {
      // Stop current music
      if (globalThis.currentMusic && globalThis.currentMusic.isPlaying) {
        globalThis.currentMusic.stop();
      }

      // Start new track
      globalThis.currentMusic = this.sound.add(key, { loop: true });
      globalThis.currentMusic.volume = volume;
      globalThis.currentMusic.play();
    }
  }


  setupPlatforms(platformPos = [[0, 800]]) {
    platformPos.forEach(pos => this.platforms.create(pos[0], pos[1], 'platform'));
  }

  setupQuick(x = 0, y = 0) {
    this.saveLevel();
    this.setupSky();
    this.setupWorld();
    this.setupMusic();
    this.setupFPS();
    this.setupKeybinds();
    this.setupPlayer(x, y);
    this.setupGroups();
    this.setupCollisions();
  }

  shrinkCollision(object, x, y) {
    object.body.setSize(x, y); // Smaller than sprite size
    object.body.setOffset(
      (object.width - x) / 2,
      (object.height - y) / 2
    );
  }

  saveLevel() {
    GameManager.area = this.key;
    console.log(this.key);
    GameManager.save();
  }
}