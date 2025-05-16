
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
let jumpPower = 150;
let jumpTimer;
let stunned = false;
let canBeHit = true;
let stunTimer;
let playerSpeed = 250;
let hitSound;
let pickupSound;

let tallPlatforms = [];

let coins;
let totalCoins;
let platforms;
let movingPlatforms;
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
  this.load.image("skylayer1", 'Assets/SkyLayer1.png');
  this.load.image("skylayer2", 'Assets/SkyLayer2.png');
  this.load.image("platform", 'Assets/platform.png');
  this.load.image("platformwide", 'Assets/platformwide.png');
  this.load.image("platformtall", 'Assets/platformtall.png');
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
  this.physics.world.setBounds(-1400, 0, 2800, 900);
  this.cameras.main.setBounds(-1600, 0, 3200, 900);
  this.add.image(600, 300, "sky").setScale(.3).setScrollFactor(0);
  this.add.image(600, 150, "skylayer1").setScale(.4).setScrollFactor(.6);
  this.add.image(600, 300, "skylayer2").setScale(.35).setScrollFactor(.2);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  hitSound = this.sound.add('playerdamage');
  pickupSound = this.sound.add('pickup');
  if (!this.sound.get('music')){
    gameMusic = this.sound.add('music', {loop: true});
    gameMusic.play();
  }


  const instructions = this.add.text(16, 48, 'Shift to dash', {
    fontSize: '32px',
    color: '#4fffff',
  });
  instructions.setScrollFactor(0);

  // Add a static platform
  platforms = this.physics.add.staticGroup();
  movingPlatforms = this.physics.add.group({allowGravity: false, immovable: true});

  const platformPositions = [
                  [-900, 300],                                        [-150, 100], [100, 200], [300, 100],             [700, 450], [900, 700], [1100, 700],
                  [-900, 500],                           [-300, 350], [-100, 225],             [300, 600],             [600, 550],             [1100, 700],
    [-1100, 700], [-900, 700],                           [-300, 700], [-100, 700], [100, 800], [300, 850], [500, 700], [700, 700], [900, 700], [1100, 700],
  ];
  const tallPlatformPositions = [[-600, 500]];
  const widePlatformPositions = [[-600, 0]];

  platformPositions.forEach(pos => platforms.create(pos[0], pos[1], "platform"));

  tallPlatformPositions.forEach(pos => {const platform = movingPlatforms.create(pos[0], pos[1], 'platformtall');
    tallPlatforms.push(platform);
});

  widePlatformPositions.forEach(pos => platforms.create(pos[0], pos[1], 'platformwide'));

  // Add Coins
  coins = this.physics.add.group({collideWorldBounds: true});
  coins.create(300, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(500, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(700, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(900, 500, 'coin').setScale(.2).setBounce(1);
  coins.create(1100, 500, 'coin').setScale(.2).setBounce(1);
  this.physics.add.collider(coins, platforms);
  totalCoins = coins.countActive(true);

      // Score UI
  scoreText = this.add.text(16, 16, 'Source: 0 / ' + totalCoins, {
    fontSize: '32px',
    color: '#4fffff'
  });
  scoreText.setScrollFactor(0);

  bullets = this.physics.add.group({allowGravity: false});

  SpawnBullets(5);
  this.time.addEvent({
    delay: 3000,
    callback: () => SpawnBullets(5),
    loop: true
  });

  sunMan = this.physics.add.group({collideWorldBounds: true});
  sunMan.create(1000, 100, 'sunMan').setBounce(1).setVelocityX(-100);
  sunMan.create(1200, 300, 'sunMan').setBounce(1).setVelocityX(-150);
  sunMan.create(1400, 400, 'sunMan').setBounce(1).setVelocityX(-250);
  sunMan.create(700, 500, 'sunMan').setBounce(1).setVelocityX(350);

  turretPlat = this.physics.add.group({allowGravity: false, collideWorldBounds: true, immovable: true});
  turretPlat1 = turretPlat.create(1200, 600, 'turretPlat').setVelocityY(-50).setBounce(1);

  fireBalls = this.physics.add.group();
  FireballSpawn(1);
  fireballTimer = setInterval(() =>{
    FireballSpawn(1);
  }, 1000);

  // Add player
  player = this.physics.add.sprite(-1100, 600, "dude");
  player.setScale(.3)
  player.setSize(105, 240);
  player.setOffset(55, 5);
  this.cameras.main.startFollow(player, false, .01, .01);

  // Add physics collider with player
  this.physics.add.collider(player, platforms, CarryPlayer, null, this);
  this.physics.add.collider(player, movingPlatforms, CarryPlayer, null, this);
  this.physics.add.collider(player, turretPlat, CarryPlayer, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  this.physics.add.overlap(player, bullets, bulletHit, null, this);
  this.physics.add.overlap(player, sunMan, SunHit, null, this);
  this.physics.add.collider(sunMan, sunMan);
  this.physics.add.overlap(player, fireBalls, bulletHit, null, this);

  // Add cursor input
  cursors = this.input.keyboard.createCursorKeys();



  this.input.on('pointerdown', function (pointer){
    console.log('MouseClickedat:', pointer.x, pointer.y);
  });

}

// Tick Function
/** @this {Phaser.Scene} */
function update() {

  const time = this.time.now;

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

  movingPlatforms.getChildren().forEach((platform) => {
    platform.originY ? undefined : platform.originY = platform.y;

    const newY = 500 + Math.sin(time * 0.001) * 150;
    platform.setY(newY);
    platform.body.updateFromGameObject();
  });
  

//   platforms.children.iterate(function (platform) {
//   if (platform.x + (platform.displayWidth / 2) < 0) {
//     platform.x = config.width + (platform.displayWidth / 2);
//   }
// });


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
  PlayerHit(bullet.body.velocity.x * 1.5, -100);
  bullet.destroy();
}

function SunHit(player, bullet)
{
  PlayerHit(bullet.body.velocity.x * 2, bullet.body.velocity.y * 1.5);
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
    Phaser.Math.Between(50, config.height-50),
    'bullet'
    );

    bullet.setVelocityX((Phaser.Math.Between(150, 300) * -1));
  }
}

//A function that moves the player with the platform
function CarryPlayer(localplayer, localplatform)
{
  //localplayer.x += localplatform.body.velocity.x * (this.game.loop.delta);
  //player.body.velocity = localplatform.body.velocity;
}

function Lerp(start, end, amount) 
{
  return start + (end - start) * amount;
}

function WalkLerp(a, modify) 
{
  if (!modify) modify = player.body.touching.down ? .5 : .04;
  
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
      player.setTint();
    }
  } else if (cursors.right.isDown && cursors.down.isUp) {
    player.setVelocityX(WalkLerp(playerSpeed));
    player.flipX = false;
    if (dashKey.isDown && canDash) { 
      player.setVelocityX(500); 
      player.setVelocityY(-50); 
      canDash = false;
      player.setTint();
    }
  } else //if (player.body.velocity.x > 0) {
    if (cursors.down.isDown){
      player.setVelocityX(WalkLerp(0, 0.01));
    } else 
      player.setVelocityX(WalkLerp(0));
  //}
  if (player.body.touching.down)
    ResetJump(true);
  if (player.body.touching.left){
    ResetJump();
    wallJump = true; wallJumpX = 300;
  }
  if (player.body.touching.right){
    ResetJump();
    wallJump = true; wallJumpX = -300;
  }

  if ((cursors.up.isDown || cursors.space.isDown ) && canJump) {
    player.setVelocityY(-jumpPower);
    if (wallJump) player.setVelocityX(wallJumpX);
    jumpPower = Math.max(0, jumpPower + game.loop.delta * 2);
    if (jumpPower >= 400) canJump = false;
    jumpTimer = setTimeout(() =>{
      canJump = false;
      jumpPower = 150;
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

function ResetJump(andDash)
{
  canJump = true;
  jumpPower = 200;
  wallJump = false;
  if (andDash){
    canDash = true;
    player.setTint(0x66ff33);
  }
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
  gameOverText.setScrollFactor(0);
}

function WinGame()
{
    const winText = this.add.text(config.width/2, config.height/2, 'YOU WIN!', {
      fontSize: '132px',
      color: '#4fffff'
  });
  winText.setOrigin(.5);
  winText.setScrollFactor(0);
}

function RestartGame()
{
  clearInterval(bulletTimer);
  clearInterval(fireballTimer);
  tallPlatforms = [];
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

function PlayerHit(x, y, d)
{
  if (!canBeHit) return;

  player.setVelocityY(y);
  player.setVelocityX(x);

  stunned = true;
  stunTimer = setTimeout(() =>{
  stunned = false;
  }, 500);
  canBeHit = false;
  setTimeout(() =>{
    canBeHit = true;
  }, 200);

  if (hitSound && hitSound.isPlaying)
    hitSound.stop();

  hitSound.play();
}

function Oscilate(object, time)
{
  object
}