import Shurikan from './PlayerProjectiles.js';

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'dude');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damageSound = this.scene.sound.add('playerHit');

        this.setScale(0.3);
        this.setSize(105, 240);
        this.setOffset(55, 5);
        this.alive = true;
        this.isCrouch = false;

        this.baseJumpPower = 150;
        this.jumpPower = this.baseJumpPower;
        this.jumpMax = 400;
        this.canJump = true;
        this.canDash = true;
        this.wallJump = false;
        this.wallJumpX = 0;
        this.stunned = false;
        this.iFrame = false;
        this.hitCD = false;

        this.tryLeftAttack = false;
        this.canLeftAttack = true;

        this.speed = 250;

        this.controls = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });
        this.cursors = scene.input.keyboard.createCursorKeys();


        this.scene.input.on('pointerdown', (pointer) => {
            this.LeftAttack(pointer);
        });
    }

    preUpdate()
    {
        if (this.tryLeftAttack)
        {

        }
        if (this.y > this.scene.physics.world.bounds.height && this.alive){
            this.Died();

            this.scene.physics?.pause(); // Stop physics

            setTimeout(() =>{
                this.scene.scene.restart(this.scene);
            }, 1000);
        }
    }


    LeftAttack(pointer)
    {
        if (this.canLeftAttack){
            this.canLeftAttack = false;
            const worldPos = pointer.positionToCamera(this.scene.cameras.main);
            const direction = new Phaser.Math.Vector2(worldPos.x - this.x, worldPos.y - this.y).normalize();

            this.shurikans.SpawnShurikan(this.x, this.y, direction);

            this.scene.time.addEvent({
                delay: 200,
                callback: () => this.canLeftAttack = true
            });
        }
    }

    TouchPlatform(player, platform)
    {
        if (this.body.touching.down) {
            this.resetJump(true);
        }

        if (this.body.touching.left) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = 400;
        }
        if (this.body.touching.right) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = -400;
        }
    }

    SetProjectileGroup(group)
    {
        this.shurikans = group;
    }

    Died()
    {
        this.alive = false;
        this.setTint(0xff0000); // Flash red
        this.anims?.stop?.(); // Stop any animations
        const gameOverText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 'YOU DIED!', {
            fontSize: '64px',
            color: '#ff0000'
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
    }

    handleInput(delta) {
        if (this.stunned || !this.alive) return;

        const { left, right, down, up, dash } = this.controls;
        const cursors = this.cursors;

        const isDown = down.isDown || cursors.down.isDown;
        const isLeft = left.isDown || cursors.left.isDown;
        const isRight = right.isDown || cursors.right.isDown;
        const isUp = up.isDown || cursors.up.isDown || cursors.space.isDown;

        const WalkLerp = (a, modify) => {
            if (!modify) modify = this.body.touching.down ? .5 : .04;
            return Phaser.Math.Linear(this.body.velocity.x, a, modify);
        };

        if (isLeft && !isDown) {
            this.setVelocityX(WalkLerp(-this.speed));
            this.flipX = true;
            if (dash.isDown && this.canDash) {
                this.Dash(-600);
            }
        } else if (isRight && !isDown) {
            this.setVelocityX(WalkLerp(this.speed));
            this.flipX = false;
            if (dash.isDown && this.canDash) {
                this.Dash(600);
            }
        } else if (isDown) {
            this.setVelocityX(WalkLerp(0, 0.01));
        } else {
            this.setVelocityX(WalkLerp(0));
        }



        if (isUp && this.canJump) {
            this.setVelocityY(-this.jumpPower);
            this.jumpPower += delta * 1.8;
            if (this.jumpPower >= this.jumpMax) this.canJump = false;
        } else {
            this.canJump = false;
            this.wallJump = false;
        }

        if (this.wallJump) {
            this.setVelocityX(this.wallJumpX);
            this.jumpMax = 320;
            this.wallJump = false;
        }

        if (isDown && !this.isCrouch) {
            this.isCrouch = true;
            this.setTexture('dudeCrouch');
            this.setSize(105, 140);
            this.setOffset(55, 105);
        } else if (!isDown && this.isCrouch) {
            this.isCrouch = false;
            this.setTexture('dude');
            this.setSize(105, 240);
            this.setOffset(55, 5);
        }
    }

    resetJump(floor) {
        this.jumpPower = this.baseJumpPower;
        this.canJump = true;
        if (floor) {
            this.canDash = true;
            this.jumpMax = 400;
            this.setTint(0x66ff33);
        }
    }

    TakeDamage(x, y, d)
    {
        if (this.iFrame) return false;
        if (this.hitCD) return false;

        this.hitCD = true;
        this.scene.time.addEvent({
            delay: 250,
            callback: () =>{
                this.hitCD = false;
            }
        });

        if (this.damageSound) {
            if (this.damageSound.isPlaying)
                this.damageSound.stop();
            this.damageSound.play();
        } else {
            // Sound not ready yet, just skip playing or log
            console.log('Damage sound not ready yet.');
        }

        this.stunned = true;

        this.scene.time.addEvent({
            delay: 500,
            callback: () =>{
                this.stunned = false;
            }
        });

        this.setVelocityX(x);
        this.setVelocityY(y);

        return true;
    }
    
    Dash(x)
    {
        this.iFrame = true;

        this.setVelocityX(x);
        this.setVelocityY(-50);
        this.canDash = false;
        this.clearTint();

        this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                this.iFrame = false;
            }
        });
    }

    CarryPlayer(player, floor)
    {
        player.setVelocityX(floor.body.velocity.x);
    }
}