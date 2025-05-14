const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#2d2d2d",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "https://labs.phaser.io/assets/skies/space3.png");
  this.load.image("platform", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create() {
  this.add.image(400, 300, "sky");

  // Add a static platform
  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 580, "platform").setScale(2).refreshBody();

  // Add player
  const player = this.physics.add.sprite(100, 450, "player");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Add physics collider
  this.physics.add.collider(player, platforms);

  // Add cursor input
  this.cursors = this.input.keyboard.createCursorKeys();

  this.player = player;
  player.setAlpha(1);
}

function update() {
  const player = this.player;
  const cursors = this.cursors;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}
