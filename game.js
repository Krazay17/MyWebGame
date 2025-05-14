
/// <reference path="types/phaser.d.ts" />
// @ts-check


var config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 800,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {y: 666, x: 0},
        debug: false,
      },
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

let player;
let coins;
let bullets;
let score = 0;
let scoreText;
let winText;
let cursors;

/** @this {Phaser.Scene} */
function preload() {
  this.load.image("sky", 'Assets/RedGalaxy2.png');
  this.load.image("platform", 'Assets/platform.png');
  this.load.image("player", 'Assets/Dude.png');
  this.load.image("coin", 'Assets/coin.png');
  this.load.image('bullet', 'Assets/bullet.png');
  this.load.audio('pickup', 'Assets/SuccessBeep.wav');
  this.load.audio('playerdamage', 'Assets/PlayerGotHit.wav');

}

/** @this {Phaser.Scene} */
function create() {
  this.add.image(600, 300, "sky").setScale(.3);

  // Add a static platform
  const platforms = this.physics.add.staticGroup();
  platforms.create(100, 700, "platform").setScale(1).refreshBody();
  platforms.create(300, 700, "platform").setScale(1).refreshBody();
  platforms.create(500, 700, "platform").setScale(1).refreshBody();
  platforms.create(700, 700, "platform").setScale(1).refreshBody();
  platforms.create(900, 600, "platform").setScale(1).refreshBody();
  platforms.create(1100, 600, "platform").setScale(1).refreshBody();
  platforms.create(1300, 500, "platform").setScale(1).refreshBody();
  platforms.create(1100, 400, "platform").setScale(1).refreshBody();
  platforms.create(900, 300, "platform").setScale(1).refreshBody();
  platforms.create(700, 200, "platform").setScale(1).refreshBody();
  platforms.create(350, 400, "platform").setScale(1).refreshBody();

  // Add Coins
  coins = this.physics.add.group();
  coins.create(300, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(500, 350, 'coin').setScale(.2).setBounce(1);
  coins.create(700, 400, 'coin').setScale(.2).setBounce(1);
  coins.create(350, 100, 'coin').setScale(.2).setBounce(1);
  this.physics.add.collider(coins, platforms);

  bullets = this.physics.add.group();
  SpawnBullets(10);
  const bulletTimer = setInterval(() =>{
    SpawnBullets(4);
  }, 5000);


  // Add player
  player = this.physics.add.sprite(100, 250, "player");
  player.setScale(.35)
  player.setSize(105, 240);
  player.setOffset(55, 5);

  // Add physics collider with player
  this.physics.add.collider(player, platforms);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  this.physics.add.overlap(player, bullets, bulletHit, null, this);

  // Add cursor input
  cursors = this.input.keyboard.createCursorKeys();

  // Score UI
  scoreText = this.add.text(16, 16, 'Coins: 0', {
    fontSize: '32px',
    color: '#4fffff'
  });
  scoreText.setScrollFactor(0);

}

/** @this {Phaser.Scene} */
function update() {

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if ((cursors.up.isDown || cursors.space.isDown )&& player.body.touching.down) {
    player.setVelocityY(-400);
  }

  coins.children.iterate(function (coin){
    coin.rotation += 0.05;
  });
}

function collectCoin(player, coin)
{
  coin.destroy();

  score ++;
  scoreText.setText('Coins: ' + score);

  this.sound.play('pickup');
  if (score == 4)
  {
    winText = this.add.text(config.width/2, config.height/2, 'YOU WIN!', {
      fontSize: '132px',
      color: '#4fffff'
  });
  }
}

function bulletHit(player, bullets)
{
  bullets.destroy();
  player.setVelocityY(-400);
  player.setVelocityX(-400);
  this.sound.play('playerdamage');
}

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SpawnBullets(amount)
{
  for (let i = 0; i < amount; i++) {
    const bullet = bullets.create(
    1400, 
    Phaser.Math.Between(config.height/2, config.height), 
    'bullet'
    );

    bullet.body.setAllowGravity(false);
    bullet.setVelocityX((Phaser.Math.Between(50, 300) * -1));
  }
}