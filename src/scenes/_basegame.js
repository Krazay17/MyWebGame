import Player from '../things/Player.js';
import NetworkManager from '../things/NetworkManager.js';
import GameManager from '../things/GameManager.js';
import SpawnManager from '../things/_spawnmanager.js';
import WeaponGroup from '../weapons/WeaponGroup.js';

export default class BaseGame extends Phaser.Scene {
  constructor(key) {
    super(key);

    this.key = key;

  }

  preload() {
    this.loadingBar();
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

  setupWorld(xleft = -1600, ytop = 0, width = 3200, height = 900) {
    this.physics.world.setBounds(xleft, ytop, width, height);
    this.bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(xleft, ytop, width, height);
    this.spawnManager = new SpawnManager(this)

    this.network = new NetworkManager(this);

    Object.values(this.network.otherPlayers).forEach(ghost => {
      ghost.updateScene(this);
    });
  }

  setupSky(a = 'sky2', ao = { x: 0, y: 0 }, b = 'sky2layer1', bo = { x: 800, y: 600 }, c = 'sky2layer2', co = { x: 600, y: 500 }) {
    this.sky1 = this.add.image(ao.x, ao.y, a).setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0);
    this.sky2 = this.add.image(bo.x, bo.y, b).setScale(.5).setScrollFactor(.2);
    this.sky3 = this.add.image(co.x, co.y, c).setScale(.5).setScrollFactor(.6);
    this.scale.on('resize', this.resizeSky, this);
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
    this.weaponGroup = new WeaponGroup(this, this.player);

    this.attackableGroups = [
      { group: this.walkableGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'platformHit' },
      { group: this.enemyGroup = this.physics.add.group(), handler: 'enemyHit' },
      { group: this.flyingEnemyGroup = this.physics.add.group({ allowGravity: false }), handler: 'enemyHit' },
      { group: this.softEnemyGroup = this.physics.add.group(), handler: 'enemyHit' },
      { group: this.staticEnemyGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'enemyHit' },
      { group: this.bulletGroup = this.physics.add.group({ allowGravity: false }), handler: 'bulletHit' },
      { group: this.softBulletGroup = this.physics.add.group({ allowGravity: false }), handler: 'bulletHit' },
      { group: this.itemGroup = this.physics.add.group(), handler: 'itemHit' },
      { group: this.staticItemGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'itemHit' }
    ];
  }

  setupCollisions() {
    this.attackableGroups.forEach(({ group, handler }) =>
      this.physics.add.overlap(
        this.weaponGroup,
        group,
        (weapon, target) => weapon[handler]?.(target),
        null,
        this
      ));

    this.physics.add.collider(this.player, this.walkableGroup, (player, walkable) => {
      player.TouchPlatform(walkable);
    }, null, this);

    this.physics.add.collider(this.player, this.staticEnemyGroup, (player, walkable) => {
      player.TouchPlatform(walkable);
    }, null, this);

    this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
      enemy.playerCollide(player, enemy);
    }, null, this);

    this.physics.add.overlap(this.player, this.flyingEnemyGroup, (player, enemy) => {
      enemy.playerCollide(player, enemy);
    }, null, this);


    this.physics.add.overlap(this.player, this.softBulletGroup, (player, bullet) => {
      bullet.playerHit(player, bullet);
    }, null, this);

    this.physics.add.overlap(this.player, this.softEnemyGroup, (player, enemy) => {
      enemy.playerCollide(player, enemy);
    }, null, this);

    this.physics.add.overlap(this.player, this.itemGroup, (player, pickup) => {
      pickup.pickup?.(player, pickup);
    }, null, this);

    this.physics.add.collider(this.player, this.staticItemGroup, (player, walkable) => {
      player.TouchPlatform(walkable);
    }, null, this);

    this.physics.add.collider(this.itemGroup, this.walkableGroup);
    this.physics.add.collider(this.enemyGroup, this.walkableGroup);
    this.physics.add.collider(this.softEnemyGroup, this.softEnemyGroup, (enemy1, enemy2) => {
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
    platformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform'));
  }

  setupQuick(x = 0, y = 0) {
    this.setupSave();
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

  setupSave() {
    GameManager.area = this.key;
    GameManager.save();
  }

  loadingBar() {
    // Create a progress bar background
    const { width, height } = this.cameras.main;
    const barWidth = 300;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = (height - barHeight) / 2;

    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 1);
    progressBarBg.fillRect(barX, barY, barWidth, barHeight);

    const progressBar = this.add.graphics();

    // Optional: Add text
    const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Listen to loading progress
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
    });
  }

  resizeSky(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        console.log('mapresize');
        this.sky1.setDisplaySize(width, height);
  }
}