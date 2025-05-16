
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
        debug: true,
      },
    },
    // fps: {
    //   target: 60,
    //   forceSetTimeOut: true,
    // },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

let player;
let stunned = false;
let stunHandle;
let playerSpeed = 200;

let coins;
let totalCoins;
let platforms;
let bullets;
let sunMan;
let score = 0;
let scoreText;
let winText;
let cursors;

/** @this {Phaser.Scene} */
function preload() {
  this.load.image("sky", 'Assets/RedGalaxy2.png');
  this.load.image("platform", 'Assets/platform.png');
  this.load.image("dude", 'Assets/Dude.png');
  this.load.image('dudeCrouch', 'Assets/DudeCrouch.png');
  this.load.image('coin', 'Assets/SourceCoin.png');
  this.load.image('bullet', 'Assets/bullet.png');
  this.load.image('sunMan', 'Assets/SunMan.png');
  this.load.audio('pickup', 'Assets/SuccessBeep.wav');
  this.load.audio('playerdamage', 'Assets/PlayerGotHit.wav');

}

/** @this {Phaser.Scene} */
function create() {
  this.add.image(600, 300, "sky").setScale(.3);

  // Add a static platform
  platforms = this.physics.add.group({allowGravity: false, immovable: true});

  const platform1 = platforms.create(100, 700, "platform").setScale(1);
  const platform2 = platforms.create(300, 700, "platform").setScale(1);
  const platform3 = platforms.create(500, 700, "platform").setScale(1);
  const platform4 = platforms.create(700, 700, "platform").setScale(1);
  const platform5 = platforms.create(900, 600, "platform").setScale(1);
  const platform6 = platforms.create(1100, 600, "platform").setScale(1);
  const platform7 = platforms.create(1300, 500, "platform").setScale(1);
  const platform8 = platforms.create(1100, 400, "platform").setScale(1);
  const platform9 = platforms.create(900, 300, "platform").setScale(1);
  const platform10 = platforms.create(700, 200, "platform").setScale(1);

  platforms.children.iterate(function (platform){
    platform.body.setVelocityX(-50);
    return undefined;
  });

  // Add Coins
  coins = this.physics.add.group({collideWorldBounds: true});
  coins.create(300, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(500, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(700, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(900, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(1100, 500, 'coin').setScale(.2).setBounce(1);
  this.physics.add.collider(coins, platforms);
  totalCoins = coins.countActive(true);

  bullets = this.physics.add.group();
  SpawnBullets(10);
  const bulletTimer = setInterval(() =>{
    SpawnBullets(4);
  }, 5000);

  sunMan = this.physics.add.group({collideWorldBounds: true});
  sunMan.create(1111, 500, 'sunMan').setBounce(1).setVelocityX(-50);

  // Add player
  player = this.physics.add.sprite(100, 250, "dude");
  player.setScale(.35)
  player.setSize(105, 240);
  player.setOffset(55, 5);

  // Add physics collider with player
  this.physics.add.collider(player, platforms, CarryPlayer, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  this.physics.add.overlap(player, bullets, bulletHit, null, this);
  this.physics.add.overlap(player, sunMan, bulletHit, null, this);

  // Add cursor input
  cursors = this.input.keyboard.createCursorKeys();

  // Score UI
  scoreText = this.add.text(16, 16, 'Source: 0', {
    fontSize: '32px',
    color: '#4fffff'
  });
  scoreText.setScrollFactor(0);

}

// Tick Function
/** @this {Phaser.Scene} */
function update() {

  MovementInput();

  if (player.y > config.height){
    loseGame.call(this);
  }

  coins.children.iterate(function (coin){
    coin.rotation += 0.05;
  });

  platforms.children.iterate(function (platform) {
  if (platform.x + (platform.displayWidth / 2) < 0) {
    platform.x = config.width + (platform.displayWidth / 2);
  }
});


}


function collectCoin(player, coin)
{
  coin.destroy();

  score ++;
  scoreText.setText('Source: ' + score);

  this.sound.play('pickup');
  if (score === totalCoins)
  {
    WinGame.call(this);
  }
}

function bulletHit(player, bullets)
{
  bullets.destroy();
  player.setVelocityY(-400);
  player.setVelocityX(-400);

  stunned = true;
  setTimeout(() =>{
    stunned = false;
}, 500);

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
    Phaser.Math.Between(config.height/2, config.height-100),
    'bullet'
    );

    bullet.body.setAllowGravity(false);
    bullet.setVelocityX((Phaser.Math.Between(50, 300) * -1));
  }
}

//A function that moves the player with the platform
function CarryPlayer(localplayer, localplatform)
{
  //localplayer.x += localplatform.body.velocity.x * (this.game.loop.delta);
  player.body.setVelocityX(localplatform.body.velocity.x);
}

function Lerp(start, end, amount) 
{
  return start + (end - start) * amount;
}

function WalkLerp(a) 
{
  const modify = player.body.touching.down ? .4 : .025;
  
  return Lerp(player.body.velocity.x, a, modify);
}

/** @this {Phaser.GameObjects.Sprite} */
function MovementInput()
{
  if (stunned) return;
  if (cursors.left.isDown) {
    player.setVelocityX(WalkLerp(-200));
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(WalkLerp(200));
    player.flipX = false;
  } else if (player.body.velocity.x > 0) {
    player.setVelocityX(WalkLerp(0));
  }
    if ((cursors.up.isDown || cursors.space.isDown ) && player.body.touching.down) {
    player.setVelocityY(-400);
  }
  if (cursors.down.isDown){
    player.setTexture('dudeCrouch');
    player.setSize(105, 140);
    player.setOffset(55, 105);
  } else if (cursors.down.isUp) {
    player.setTexture('dude');
    player.setSize(105, 240);
    player.setOffset(55, 5);
  }
}

/** @this {Phaser.Scene} */
function loseGame() 
{
  this.physics?.pause(); // Stop physics
  player.setTint(0xff0000); // Flash red
  player.anims?.stop?.(); // Stop any animations
  const gameOverText = this.add.text(config.width / 2, config.height / 2, 'YOU LOSE', {
    fontSize: '64px',
    color: '#ff0000'
  });
  gameOverText.setOrigin(0.5);
}

function WinGame()
{
    winText = this.add.text(config.width/2, config.height/2, 'YOU WIN!', {
      fontSize: '132px',
      color: '#4fffff'
  });
}