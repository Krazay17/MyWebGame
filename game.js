
/// <reference path="types/phaser.d.ts" />
// @ts-check


var config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {y: 666, x: 0},
        debug: false,
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

let restartKey;
let gameMusic;

let player;
let dashKey;
let canJump;
let canDash = true;
let wallJump = false;
let wallJumpX;
let jumpPower = 200;
let jumpTimer;
let stunned = false;
let stunHandle;
let stunTimer;
let playerSpeed = 250;
let hitSound;
let pickupSound;

let coins;
let totalCoins;
let platforms;
let bullets;
let bulletTimer;
let sunMan;
let turretPlat;
let turretPlat1;
let fireBalls;
let fireballTimer;
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
  this.load.image('turretPlat', 'Assets/TurretPlatform.png');
  this.load.image('fireBall', 'Assets/Fireball.png');
  this.load.audio('pickup', 'Assets/SuccessBeep.wav');
  this.load.audio('playerdamage', 'Assets/PlayerGotHit.wav');
  this.load.audio('music', 'Assets/Music.wav');

}

/** @this {Phaser.Scene} */
function create() {
  this.add.image(600, 300, "sky").setScale(.3).setScrollFactor(0);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  hitSound = this.sound.add('playerdamage');
  pickupSound = this.sound.add('pickup');
  if (!this.sound.get('music')){
    gameMusic = this.sound.add('music', {loop: true});
    gameMusic.play();
  }

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
  const platform9 = platforms.create(900, 350, "platform").setScale(1);
  const platform10 = platforms.create(700, 550, "platform").setScale(1);
  const platform11 = platforms.create(400, 550, "platform").setScale(1);
  const platform12 = platforms.create(100, 550, "platform").setScale(1);
  const platform13 = platforms.create(900, 600, "platform").setScale(1);
  const platform14 = platforms.create(300, 400, "platform").setScale(1);

  // platforms.children.iterate(function (platform){
  //   platform.body.setVelocityX(-50);
  //   return undefined;
  // });

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
  bulletTimer = setInterval(() =>{
    SpawnBullets(4);
  }, 5000);

  sunMan = this.physics.add.group({collideWorldBounds: true});
  sunMan.create(1000, 300, 'sunMan').setBounce(1).setVelocityX(-100);
  sunMan.create(1200, 300, 'sunMan').setBounce(1).setVelocityX(-150);

  turretPlat = this.physics.add.group({allowGravity: false, collideWorldBounds: true, immovable: true});
  turretPlat1 = turretPlat.create(1200, 600, 'turretPlat').setVelocityY(-50).setBounce(1);

  fireBalls = this.physics.add.group();
  FireballSpawn(1);
  fireballTimer = setInterval(() =>{
    FireballSpawn(1);
  }, 1000);

  // Add player
  player = this.physics.add.sprite(100, 250, "dude");
  player.setScale(.3)
  player.setSize(105, 240);
  player.setOffset(55, 5);
  this.cameras.main.startFollow(player, false, .01, .01);

  // Add physics collider with player
  this.physics.add.collider(player, platforms, CarryPlayer, null, this);
  this.physics.add.collider(player, turretPlat, CarryPlayer, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  this.physics.add.overlap(player, bullets, bulletHit, null, this);
  this.physics.add.collider(player, sunMan, SunHit, null, this);
  this.physics.add.collider(sunMan, sunMan);
  this.physics.add.overlap(player, fireBalls, bulletHit, null, this);

  // Add cursor input
  cursors = this.input.keyboard.createCursorKeys();

  // Score UI
  scoreText = this.add.text(16, 16, 'Source: 0', {
    fontSize: '32px',
    color: '#4fffff'
  });
  scoreText.setScrollFactor(0);

  this.input.on('pointerdown', function (pointer){
    console.log('MouseClickedat:', pointer.x, pointer.y);
  });

}

// Tick Function
/** @this {Phaser.Scene} */
function update() {
  if (restartKey.isDown){
    RestartGame.call(this);
  }

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

  if (pickupSound && pickupSound.isPlaying)
    pickupSound.stop();
  pickupSound.play();

  if (score === totalCoins)
  {
    WinGame.call(this);
  }
}

function bulletHit(player, bullet)
{
  player.setVelocityY(-200);
  player.setVelocityX(bullet.body.velocity.x);
  bullet.destroy();

  stunned = true;
  stunTimer = setTimeout(() =>{
    stunned = false;
}, 500);

  if (hitSound && hitSound.isPlaying)
    hitSound.stop();
  hitSound.play();
}

function SunHit(player, bullet)
{
  player.setVelocityY(-200);
  player.setVelocityX(bullet.body.velocity.x);

  stunned = true;
  stunTimer = setTimeout(() =>{
    stunned = false;
}, 500);

  if (hitSound && hitSound.isPlaying)
    hitSound.stop();
  hitSound.play();
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
    Phaser.Math.Between(300, config.height-100),
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
  const modify = player.body.touching.down ? .5 : .04;
  
  return Lerp(player.body.velocity.x, a, modify);
}

function MovementInput()
{
  if (stunned) return;
  if (cursors.left.isDown && cursors.down.isUp) {
    player.setVelocityX(WalkLerp(-playerSpeed));
    player.flipX = true;
    if (dashKey.isDown && canDash){ 
      player.setVelocityX(-500); 
      player.setVelocityY(-50); 
      canDash = false;
    }
  } else if (cursors.right.isDown && cursors.down.isUp) {
    player.setVelocityX(WalkLerp(playerSpeed));
    player.flipX = false;
    if (dashKey.isDown && canDash) { 
      player.setVelocityX(500); 
      player.setVelocityY(-50); 
      canDash = false;
    }
  } else if (player.body.velocity.x > 0) {
    player.setVelocityX(WalkLerp(0));
  }
  if (player.body.touching.down || player.body.touching.left || player.body.touching.right){
    ResetJump();
    if (player.body.touching.left) wallJump = true; wallJumpX = 300;
    if (player.body.touching.right) wallJump = true; wallJumpX = -300;
  }
  if ((cursors.up.isDown || cursors.space.isDown ) && canJump) {
    player.setVelocityY(-jumpPower);
    if (wallJump) player.setVelocityX(wallJumpX);
    jumpPower = Math.max(0, jumpPower + game.loop.delta * 2);
    if (jumpPower >= 400) canJump = false;
    jumpTimer = setTimeout(() =>{
      canJump = false;
      jumpPower = 200;
    }, 400);
  } else {
    canJump = false;
    clearTimeout(jumpTimer);
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

function ResetJump()
{
  canJump = true;
  jumpPower = 200;
  wallJump = false;
  canDash = true;
  clearTimeout(jumpTimer);
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

function RestartGame()
{
  clearInterval(bulletTimer);
  clearInterval(fireballTimer);
  this.scene.restart();
  score = 0;
}

function FireballSpawn(amount)
{
  for (let i = 0; i < amount; i++) {
    const fireBall = fireBalls.create(
    turretPlat1.x, 
    turretPlat1.y-10,
    'fireBall'
    );

    fireBall.body.setAllowGravity(false);
    fireBall.setVelocityX(-444);
  }
}

function PlayerShoot()
{
}