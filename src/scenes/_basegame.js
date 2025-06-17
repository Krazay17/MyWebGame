import Player from '../things/Player.js';
import NetworkManager from '../things/NetworkManager.js';
import GameManager from '../things/GameManager.js';
import SpawnManager from '../things/_spawnmanager.js';
import WeaponGroup from '../weapons/WeaponGroup.js';
import Duck from '../things/enemyDuck.js';
import SoundUtil from '../things/soundUtils.js';

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

    // if (this.network) {
    //   this.network.socket.emit('playerMove', {
    //     x: this.player.x,
    //     y: this.player.y
    //   });
    // }
  }

  setupWorld(xleft = -1600, ytop = 0, width = 6400, height = 6400) {
    this.physics.world.setBounds(xleft, ytop, width, height);
    this.bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(xleft, ytop, width, height);

    this.network = new NetworkManager(this);
    this.spawnManager = new SpawnManager(this)

    this.network.refreshScene(this);
    this.sound.pauseOnBlur = false;

    this.input.on('wheel', (wheel) => {
      if (!this.zoom) this.zoom = 1;
      // Step 1: Adjust zoom
      this.zoom -= wheel.deltaY / 1000;

      // Step 2: Clamp
      this.zoom = Phaser.Math.Clamp(this.zoom, 0.6, 3);

      // Step 3: Snap to nearest 0.2
      this.zoom = Phaser.Math.Snap.To(this.zoom, 0.1);


      this.sky1.setScale(1 / this.zoom);
      this.cameras.main.setZoom(this.zoom)
      //this.resizeBackgroundToFill();
    })

    GameManager.area = this.key;
    window.addEventListener('beforeunload', () => {
      GameManager.area = this.key;
      GameManager.location.x = this.player.x;
      GameManager.location.y = this.player.y;
      GameManager.save();
    });

    // window.addEventListener('focus', () => {
    //   this.sound.mute = false;
    // });

    // window.addEventListener('blur', () => {
    //   this.sound.mute = true;
    // });
  }

  setupSky({ sky1 = 'purplesky0', sky2 = true, sky3 = true } = {}) {
    this.sky1 = this.add.image(this.scale.width / 2, this.scale.height / 2, sky1)
      .setOrigin(.5).setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0);

    if (sky2) this.sky2 = this.add.image(400, 600, 'purplesky1').setScale(1).setScrollFactor(.2);
    if (sky3) this.sky3 = this.add.image(400, 600, 'purplesky2').setScale(1).setScrollFactor(.6);

    this.scale.on('resize', this.resizeSky, this);
  }

  setupPlayer(x = 0, y = 0) {
    const locationX = GameManager.portalTravel ? x : GameManager.location.x;
    const locationY = GameManager.portalTravel ? y : GameManager.location.y;

    this.player = new Player(this, locationX, locationY);
    this.cameras.main.startFollow(this.player, false, .04, .04);


    if (!this.scene.isActive('Inventory')) {
      this.scene.launch('Inventory', { player: this.player });
      this.invMenu = this.scene.get('Inventory');
    } else {
      this.invMenu = this.scene.get('Inventory');
      this.invMenu.init({ player: this.player });
    }


    this.input.keyboard.on('keydown-C', () => {
      this.invMenu.scene.setVisible(true);
      this.invMenu.scene.setActive(true);
      this.invMenu.input.enabled = true;
    });
    this.input.keyboard.on('keyup-C', () => {
      this.invMenu.scene.setVisible(false);
      this.invMenu.input.enabled = false;
      this.invMenu.scene.setActive(false);
    });

    if (!this.scene.isActive('PlayerUI')) {
      this.scene.launch('PlayerUI', { player: this.player, gameScene: this });
      this.playerUI = this.scene.get('PlayerUI');
    } else {
      this.playerUI = this.scene.get('PlayerUI');
      this.playerUI.init({ player: this.player, gameScene: this });
    }
    if (!this.scene.isActive('EscMenu')) {
      this.scene.launch('EscMenu', { gameScene: this, playerUI: this.playerUI });
      this.escMenu = this.scene.get('EscMenu');
    } else {
      this.escMenu = this.scene.get('EscMenu');
      this.escMenu.init({ gameScene: this, playerUI: this.playerUI })
    }
  }

  spawnPlayer(x, y) {
    if (GameManager.portalTravel) {
      this.player.setPosition(x, y);
      GameManager.location.x = x;
      GameManager.location.y = y;
      GameManager.portalTravel = false;
    }
  }


  setupTileMap(tilemap = 'tilemap1', tilesheet = 'tilesheet') {
    const map = this.make.tilemap({ key: tilemap });
    const tileset = map.addTilesetImage(tilesheet, tilesheet);
    const layer1 = map.createLayer('layer1', tileset, 0, 0);
    const layer2 = map.createLayer('layer2', tileset, 0, 0);
    this.walls = map.createLayer('walls', tileset, 0, 0);
    const walls2 = map.createLayer('walls2', tileset, 0, 0);

    this.walls.setCollisionByExclusion([-1]); // excludes only empty tiles
    walls2.setCollisionByExclusion([-1]); // excludes only empty tiles
    this.tilemapColliders = [
      { walls: this.walls, handler: 'touchWall' },
      { walls: walls2, handler: 'touchFireWall' },
    ];

    const objects = map.getObjectLayer('objects');
    objects.objects.forEach(obj => {
      this[obj.name]?.(obj.x, obj.y, obj.text?.text);
    });

    this.events.on('shutdown', () => {

      if (this.walls) {
        this.walls.destroy();
        this.walls = null;
      }

      if (this.map) {
        this.map.destroy();
        this.map = null;
      }
    });

  }

  setupGroups() {
    this.weaponGroup = new WeaponGroup(this, this.player);
    this.spawnManager.setupGroups(this);
    this.walkableGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    const spawnGroups = this.spawnManager.getGroups();

    this.attackableGroups = [
      { group: this.walkableGroup, handler: 'platformHit', zap: false },
      ...spawnGroups,
    ]

    this.walkingGroups = [
      { group: this.player },
      ...spawnGroups.filter(({ walls }) => walls ?? true),
    ]

    // this.attackableGroups = [
    //   { group: this.walkableGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'platformHit', zap: false },
    //   { group: this.enemyGroup = this.physics.add.group(), handler: 'enemyHit', zap: true },
    //   // { group: this.flyingEnemyGroup = this.physics.add.group({ allowGravity: false }), handler: 'enemyHit' },
    //   { group: this.sunmanGroup = this.physics.add.group({ classType: Duck, runChildUpdate: true, allowGravity: false }), handler: 'enemyHit', zap: true },
    //   { group: this.staticEnemyGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'enemyHit', zap: true },
    //   { group: this.bulletGroup = this.physics.add.group({ allowGravity: false }), handler: 'bulletHit', zap: true },
    //   { group: this.softBulletGroup = this.physics.add.group({ allowGravity: false }), handler: 'bulletHit', zap: true },
    //   { group: this.itemGroup = this.physics.add.group(), handler: 'itemHit', zap: false },
    //   { group: this.staticItemGroup = this.physics.add.group({ allowGravity: false, immovable: true }), handler: 'itemHit', zap: false }
    // ];
  }

  setupCollisions() {
    const spawnGroups = this.spawnManager.getGroups();

    this.attackableGroups.forEach(({ group, handler }) =>
      this.physics.add.overlap(group, this.weaponGroup, (target, weapon) => {
        weapon[handler]?.(target);
      },
        null,
        this
      ));

    spawnGroups.forEach(({ group }) =>
      this.physics.add.overlap(this.player, group, (player, entity) => {
        entity.playerCollide?.(entity, player);
      }, null, this));


    this.walkingGroups.forEach(({ group }) =>
      this.physics.add.collider(group, this.walkableGroup, (entity, wall) => {
        entity.touchWall?.(wall);
      }, null, this));

    // TileMap wall collisions
    if (this.tilemapColliders?.length) {
      this.tilemapColliders.forEach(({ walls, handler }) => {
        this.physics.add.collider(walls, this.weaponGroup, null, (wall, weapon) => {
          weapon[handler]?.(wall);

          if (weapon.ignoreWall) {
            return false;
          }
          return true;
        }, this);

        this.walkingGroups.forEach(({ group }) =>
          this.physics.add.collider(group, walls, (entity, wall) => {
            entity[handler]?.(wall);
          }, null, this));
      });
    }

    this.physics.add.collider(this.weaponGroup, this.walkableGroup);

    // this.walkableCollider = this.physics.add.collider(this.player, this.walkableGroup, (player, walkable) => {
    //   player.touchWall(walkable);
    // }, null, this);

    // this.physics.add.collider(this.player, this.staticEnemyGroup, (player, walkable) => {
    //   player.touchWall(walkable);
    // }, null, this);

    // this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
    //   enemy.playerCollide(player, enemy);
    // }, null, this);

    // this.physics.add.overlap(this.player, this.flyingEnemyGroup, (player, enemy) => {
    //   enemy.playerCollide(player, enemy);
    // }, null, this);


    // this.physics.add.overlap(this.player, this.softBulletGroup, (player, bullet) => {
    //   bullet.playerHit(player, bullet);
    // }, null, this);

    // this.physics.add.overlap(this.player, this.sunmanGroup, (player, enemy) => {
    //   enemy.playerCollide(player, enemy);
    // }, null, this);

    // this.physics.add.overlap(this.player, this.itemGroup, (player, pickup) => {
    //   pickup.pickup?.(player, pickup);
    // }, null, this);

    // this.physics.add.collider(this.player, this.staticItemGroup, (player, walkable) => {
    //   player.touchWall(walkable);
    // }, null, this);

    // this.physics.add.collider(this.weaponGroup, this.staticItemGroup);
    // this.physics.add.collider(this.weaponGroup, this.walkableGroup);
    // this.physics.add.collider(this.itemGroup, this.walkableGroup);
    // this.physics.add.collider(this.enemyGroup, this.walkableGroup);
    // this.physics.add.collider(this.enemyGroup, this.enemyGroup);
    // this.physics.add.collider(this.sunmanGroup, this.sunmanGroup, (enemy1, enemy2) => {
    // }, null, this);
  }

setupMusic(key = 'music1', volume = 1) {
    // this.currentMusic = this.sound.add(key, { loop: true });
    // this.currentMusic.volume = GameManager.volume.music * volume;

    // const storedTime = this.game.registry.get('music_seek_time');
    // if (storedTime !== undefined) {
    //   this.currentMusic.seek = storedTime;
    // }

    // this.currentMusic.play();

    // const shutdownHandler = () => {
    //   if (this.currentMusic) {
    //     const currentTime = this.currentMusic.seek;
    //     this.game.registry.set('music_seek_time', currentTime);
    //     this.currentMusic.stop();
    //     this.currentMusic.destroy();
    //     this.currentMusic = null;
    //   }
    // };

    // this.events.once('shutdown', shutdownHandler);
    // this.events.once('destroy', shutdownHandler);

    SoundUtil.setup(this, key);

    const shutdownHandler = () => {
      SoundUtil.savePosition();
    }
    
    this.events.once('shutdown', shutdownHandler);
}



  setupPlatforms(platformPos = [[0, 800]]) {
    platformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform'));
  }

  setupQuick(x = 0, y = 0) {
    this.setupSky();
    this.setupWorld();
    this.setupTileMap()
    this.setupPlayer(x, y);
    this.setupGroups();
    this.setupCollisions();
    this.setupMusic();
  }

  shrinkCollision(object, x, y) {
    object.body.setSize(x, y); // Smaller than sprite size
    object.body.setOffset(
      (object.width - x) / 2,
      (object.height - y) / 2
    );
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
      if (value === 1) {
        loadingText.destroy();
        progressBar.clear();
      }
    });
  }

  resizeSky(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.sky1.setPosition(width / 2, height / 2);
  }

  spawnSunman(x, y) {
    this.spawnManager.spawnSunMan(x, y, 10)
  }

  spawnBullets(x, y, text) {
    const delay = parseInt(text, 10);

    this.time.addEvent({
      delay: delay,
      loop: true,
      callback: () => {
        this.spawnManager.spawnBullet(x, y);
      }
    })

    // if (!this.bulletSpawnLocs) {
    //   this.bulletSpawnLocs = [];

    //   this.time.addEvent({
    //     delay: delay,
    //     loop: true,
    //     callback: () => {
    //       this.bulletSpawnLocs.forEach(([x, y]) => {
    //         this.spawnManager.spawnBullet(x, y);
    //         console.log('fire')

    //       })
    //     }
    //   })
    // }
    // this.bulletSpawnLocs.push([x, y])
  }

spawnDuck(x, y) {
    const duck = this.spawnManager.spawnDuck(x, y, 20);

    duck.once('die', () => {

        const checkDistanceTimer = this.time.addEvent({
            delay: 1000, // check every 1 second (adjust if you want)
            callback: () => {
                const dx = this.player.x - x;
                const dy = this.player.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                console.log('Checking duck respawn, distance:', distance);

                if (distance > 800) {
                    console.log('Respawning duck');
                    this.spawnDuck(x, y);
                    checkDistanceTimer.remove(); // stop checking
                }
            },
            loop: true
        });

    });
}


  spawnCoin(x, y) {
    const coin = this.spawnManager.SpawnCoin(x, y);
    coin.on('pickup', () => {
      this.time.delayedCall(25000, () => {
        this.spawnCoin(x, y);
      })
    })
  }

  spawnSourceBlock(x, y) {
    const block = this.spawnManager.spawnSourceBlock(x, y);
  }
}