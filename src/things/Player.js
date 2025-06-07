import GameManager from "./GameManager.js";
import NetworkManager from "./NetworkManager.js";
import RankSystem from "./RankSystem.js";
import { createWeapon } from "../weapons/WeaponManager.js"
import ChatBubble from "./chatBubble.js";
import PlayerContainer from "./playerContainer.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dudesheet');

        GameManager.load();
        this.network = NetworkManager.instance;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setMaxSpeed(1000);
        this.body.setMaxVelocity(1000, 1000);


        this.setupAnimation();

        this.damageSound = this.scene.sound.add('playerHit');

        this.setScale(0.35);
        this.setDepth(10);
        this.setSize(115, 250);
        this.setOffset(70, 0);
        this.baseHitBoxSize = { y: 250, yo: 0 };
        this.alive = true;
        this.stats = { health: 25, healthMax: 25 }
        this.healthMax = 25;
        this.health = 25;
        this.deathPenalty;
        this.money = GameManager.power.money;
        this.auraLevel = GameManager.power.auraLevel;
        this.name = GameManager.name;

        this.isCrouch = false;
        this.baseJumpPower = 150;
        this.jumpPower = this.baseJumpPower;
        this.jumpMax = 400;
        this.canJump = true;
        this.canDash = true;
        this.canResetDash = true;
        this.canSlide = true;
        this.crouchCD = 0;
        this.wallJump = false;
        this.wallJumpX = 0;
        this.stunned = false;
        this.iFrame = false;
        this.hitCD = false;

        // this.playerUI;
        // if (!this.scene.scene.isActive('EscMenu')) {
        // this.scene.scene.launch('EscMenu', { gameScene: this.scene });
        // } else {

        // }
        // if (!this.scene.scene.isActive('Inventory')) {
        // this.scene.scene.launch('Inventory', { player: this });
        // }
        // if (!this.scene.scene.isActive('PlayerUI')) {
        // this.scene.scene.launch('PlayerUI', { player: this });
        // }

        // this.playerContainer = new PlayerContainer(scene, this.x, this.y);
        this.equipWeapon(GameManager.weapons.left, 0);
        this.equipWeapon(GameManager.weapons.right, 1);
        this.equipWeapon('zap', 2)
        this.weapons = [this.leftWeapon, this.rightWeapon];

        this.healthTick = 0;
        this.tryLeftAttack = false;
        this.canLeftAttack = true;
        this.canRightAttack = true;
        this.leftSpam = 0;
        this.rightSpam = 0;
        this.speed = 250;

        this.rankSystem = new RankSystem();


        this.controls = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
            dash: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false)

        };
        this.myPointer = new Phaser.Input.Pointer(this.scene.input.manager, 1)


        this.scene.input.on('pointerdown', (pointer) => {
            if (GameManager.flags.devmode && pointer.middleButtonDown()) {
                const worldPos = pointer.positionToCamera(this.scene.cameras.main);
                this.setPosition(worldPos.x, worldPos.y);
                this.setVelocity(0);
            } else {
                // const distance = new Phaser.Math.Vector2(pointer)
                // scene.cameras.main.setOffset
            }
        });
        this.scene.input.keyboard.on('keydown-F', () => {
            if (GameManager.flags.devmode) {
                this.updateMoney(5000);
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased()) {
                this.leftWeapon.release();
            } else if (pointer.rightButtonReleased()) {
                this.rightWeapon.release();
            }
        });

        this.scene.input.keyboard.on('keydown-T', () => {
            if (this.scene.scene.key !== 'Home' && this.body.blocked.down && !this.playerUI.Chatting) {
                this.scene.scene.start('Home')
            }
        });
        this.scene.input.keyboard.on('keydown-R', () => {
            if (!this.playerUI.Chatting) {
                this.Died();
                this.scene.scene.restart();
            }
        });

        this.setStats();
        this.resetJump();
        this.resetDash();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.aura) this.aura.update?.(delta);
        if (this.chatBubble) this.chatBubble.setPosition(this.x, this.y - 100);
        if (this.playerContainer) this.playerContainer.setPosition(this.x, this.y);

        if (this.alive && !this.stunned && this.leftWeapon && this.rightWeapon) {
            this.leftWeapon.update?.(delta);
            this.rightWeapon.update?.(delta);

            const pointer = this.scene.input.activePointer;

            if (pointer.leftButtonDown() && !this.inventory.scene.isVisible()) {
                this.leftWeapon.fire(pointer);
            }
            if (pointer.rightButtonDown() && !this.inventory.scene.isVisible()) {
                this.rightWeapon.fire(pointer);
            }

            if (this.y > this.scene.physics.world.bounds.height + this.body.height + 150 && this.alive) {
                this.Died();
            }
        }
        if (this.knockbackVelocity) {
            if (this.knockbackVelocity.length() > 0.1) {
                this.setVelocityX(this.knockbackVelocity.x); // or setVelocity if using Arcade
                this.setVelocityY(this.knockbackVelocity.y);
                this.knockbackVelocity.scale(0.9); // decay over time
            } else {
                this.knockbackVelocity.set(0, 0);
            }
        }
    }

    setStats() {
        this.healthMax = GameManager.stats.healthMax ?? 25;
        this.health = GameManager.stats.health ?? 25;
        this.emit('updateHealth', this.health, this.healthMax);
    }

    Died() {
        if (this.alive == false) return;
        this.alive = false;

        this.deathPenalty = Math.floor(-GameManager.power.money / 2);
        this.updateMoney(this.deathPenalty);

        GameManager.stats.health = this.healthMax;

        this.leftSpam = 0;
        this.rightSpam = 0;

        this.setTint(0xff0000); // Flash red
        this.anims?.stop?.(); // Stop any animations

        const gameOverText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            'YOU DIED!\n' + this.deathPenalty + ' Source', {
            fontSize: '64px',
            color: '#ff0000'
        });

        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        this.scene.physics?.pause(); // Stop physics
        this.scene.time.delayedCall(2000, () => {
            this.scene.scene.restart()
        });
        this.emit('playerdied');

        GameManager.save();
    }


    TouchPlatform(player, platform) {
        if (this.body.blocked.down) {
            this.resetJump();
            this.resetDash();
        }

        if (this.body.blocked.left) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = 400;
        }
        if (this.body.blocked.right) {
            this.resetJump();
            this.wallJump = true;
            this.wallJumpX = -400;
        }
    }

    touchFireWall(wall) {
        const tileWorldX = wall.getCenterX();
        const tileWorldY = wall.getCenterY();
        const rawDirection = new Phaser.Math.Vector2(this.x - tileWorldX, this.y - tileWorldY);
        const angle = Phaser.Math.Snap.To(rawDirection.angle(), Phaser.Math.DegToRad(90)); // Snap to 90°
        const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
        //this.knockbackVelocity = direction.scale(50);

        const velocity = direction.scale(600);
        this.TakeDamage(velocity.x, velocity.y, 5, 300);

    }

    handleInput(delta) {
        if (this.stunned || !this.alive) return;

        const { left, right, down, up, jump, dash } = this.controls;

        const isDown = down.isDown;
        const isLeft = left.isDown;
        const isRight = right.isDown;
        const isUp = up.isDown;
        const isJump = jump.isDown;
        const isChatting = this.playerUI.Chatting;

        const WalkLerp = (a, modify) => {
            if (!modify) modify = this.body.blocked.down ? .5 : .09;

            modify = Phaser.Math.Clamp(modify * (delta / 16.666), 0, 1);
            return Phaser.Math.Linear(this.body.velocity.x, a, modify);
        };
        if ((isLeft || isRight)) this.syncNetwork();

        if (isLeft && !isDown && !isChatting) {
            this.setVelocityX(WalkLerp(-this.speed));
            this.flipX = true;
            if (this.body.blocked.down) {
                this.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(-600);
            }
        } else if (isRight && !isDown && !isChatting) {
            this.setVelocityX(WalkLerp(this.speed));
            this.flipX = false;
            if (this.body.blocked.down) {
                this.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(600);
            }
        } else if (isDown && !isChatting) {
            var crouchSpeed;

            const slideBoost = (speed) => {

                this.canSlide = false;
                this.slideAnim = true;
                this.scene.time.delayedCall(900, () => this.slideAnim = false);
                this.setVelocityX(speed);
            }

            if (isRight && this.body.blocked.down) {
                crouchSpeed = this.speed * .30;
                if (!this.slideAnim) this.play('dudecrouch', true);
                this.flipX = false;
            } else if (isLeft && this.body.blocked.down) {
                crouchSpeed = -this.speed * .30;
                if (!this.slideAnim) this.play('dudecrouch', true);
                this.flipX = true;
            } else {
                this.setFrame(6);
                crouchSpeed = 0;
            }
            if (this.canSlide && this.body.blocked.down) {
                this.stop();
                this.setFrame(9)
                slideBoost(crouchSpeed * 9);
            }

            this.setVelocityX(WalkLerp(crouchSpeed, .025));
        } else {
            // not moving or crouching
            this.setVelocityX(WalkLerp(0));
            if (this.body.blocked.down) this.setFrame(0);
            else this.setFrame(2);
        }

        if (!isDown && !this.canSlide) {
            if (this.crouchCD < 1000) {
                this.crouchCD += delta;
            } else {
                this.canSlide = true;
                this.crouchCD = 0;
            }
        }

        if (isJump && this.canJump && !isChatting) {
            this.setVelocityY(-this.jumpPower);
            this.jumpPower += delta * 1.8;
            this.stop();
            this.setFrame(1);
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

        if (isDown && !isChatting && !this.isCrouch) {
            this.isCrouch = true;
            this.hitBoxSize = { y: 180, yo: 70 };
            this.setSize(115, 180);
            this.setOffset(70, 70);
            this.scene.physics.world.collide(this, this.scene.walkableGroup);
        } else if (!isDown && this.isCrouch) {
            this.isCrouch = false;
        } else if (!isDown && !this.isCrouch && (this.lerpHitBox(delta) === false)) {
            this.lerpHitBox(delta)
        }

        if (isUp && !isChatting) {
            this.healthTick += delta / 300;
            this.speed = 100;
            this.stop();
            this.setFrame(10)
        this.body.setMaxVelocity(200, 100);
            if (this.healthTick > 1) {
                this.healthTick = 0;
                this.health = Math.min(this.healthMax, this.health + 1);
                this.updateMoney(-1);
                this.emit('updateHealth', this.health, this.healthMax);
                this.network.socket.emit('updateHealth', this.health, this.healthMax);
            }
        } else {

            this.speed = 250;
        this.body.setMaxVelocity(1000, 1000);
        }
    }

    lerpHitBox(delta) {
        if (!this.hitBoxSize) return;
        let done = true;

        // Interpolate height
        if (Math.abs(this.hitBoxSize.y - this.baseHitBoxSize.y) > 1) {
            this.hitBoxSize.y = Phaser.Math.Linear(this.hitBoxSize.y, this.baseHitBoxSize.y, delta / 100); // smoothing factor
            this.setSize(115, this.hitBoxSize.y);
            done = false;
        } else {
            this.hitBoxSize.y = this.baseHitBoxSize.y;
            this.setSize(115, this.hitBoxSize.y);
        }

        // Interpolate offset
        if (Math.abs(this.hitBoxSize.yo - this.baseHitBoxSize.yo) > 1) {
            this.hitBoxSize.yo = Phaser.Math.Linear(this.hitBoxSize.yo, this.baseHitBoxSize.yo, delta / 100);
            this.setOffset(70, this.hitBoxSize.yo);
            done = false;
        } else {
            this.hitBoxSize.yo = this.baseHitBoxSize.yo;
            this.setOffset(70, this.hitBoxSize.yo);
        }

        return done;
    }

    resetJump() {
        this.jumpPower = this.baseJumpPower;
        this.canJump = true;

    }

    TakeDamage(x, y, damage = 1, stunDuration = 300) {
        if (this.iFrame) return false;
        if (this.hitCD) return false;

        this.hitCD = true;
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.hitCD = false;
            }
        });

        this.health = Phaser.Math.Clamp(this.health - damage, 0, this.healthMax);
        GameManager.stats.health = this.health;
        this.emit('updateHealth', this.health, this.healthMax);
        this.network.socket.emit('updateHealth', this.health, this.healthMax);
        if (this.health === 0) {
            this.Died();
        }


        if (this.damageSound) {
            if (this.damageSound.isPlaying)
                this.damageSound.stop();
            this.damageSound.play();
        }

        this.stunned = true;
        this.emit('playerstunned');
        this.stop();
        this.setFrame(8);
        this.scene.time.removeEvent(this.stunTimer);
        this.stunTimer = this.scene.time.addEvent({
            delay: stunDuration,
            callback: () => {
                this.stunned = false;
            }
        });

        this.setVelocityX(x);
        this.setVelocityY(y);

        this.updateMoney(-damage);

        return true;
    }

    resetDash() {
        if (this.canResetDash) {
            this.queResetDash = false;
            this.canDash = true;
            this.jumpMax = 425;
            this.setTint(0x66ff33);
        } else {
            this.queResetDash = true;
        }
    }

    Dash(x) {
        this.iFrame = true;
        this.canDash = false;
        this.canResetDash = false;

        this.setVelocityX(x);
        this.setVelocityY(-50);
        this.clearTint();

        this.scene.time.addEvent({
            delay: 350,
            callback: () => {
                this.iFrame = false;
            }
        });
        this.scene.time.addEvent({
            delay: 650,
            callback: () => {
                this.canResetDash = true;
                if (this.queResetDash) this.resetDash();
            }
        });
    }

    CarryPlayer(player, floor) {
        player.setVelocityX(floor.body.velocity.x);
    }

    PickupItem(money = 0) {
        if (money > 0) {
            this.updateMoney(money);
        }
    }

    updateMoney(money) {
        const intMoney = Math.floor(money);
        const prevMoney = GameManager.power.money;
        GameManager.power.money = Math.max(0, GameManager.power.money + intMoney);
        GameManager.save();
        this.playerUI.scoreText.text = 'Source: ' + GameManager.power.money + '\n' + this.rankSystem.getRank(GameManager.power.money);
        this.network.socket.emit('playerLevel', GameManager.power);
    }

    setupAnimation() {
        if (!this.scene.anims.get('dudewalk')) {
            this.scene.anims.create({
                key: 'dudewalk',
                frames: this.anims.generateFrameNumbers('dudesheet', { start: 2, end: 4 }),
                frameRate: 10,
                repeat: -1,
            });
        }

        if (!this.scene.anims.get('dudecrouch')) {
            this.scene.anims.create({
                key: 'dudecrouch',
                frames: this.anims.generateFrameNumbers('dudesheet', { start: 6, end: 8 }),
                frameRate: 8,
                repeat: -1,
            });
        }

    }

    syncNetwork() {
        if (this.tryingToSync) return;
        this.tryingToSync = true;
        setTimeout(() => this.tryingToSync = false, 500);

        if (!this.network.socket.connected && !this.network.socket.reconnecting) {
            this.network.socket.connect();
        }

        this.network.socket.emit('playerSyncRequest', { x: this.x, y: this.y, data: { name: GameManager.name, power: GameManager.power } });

    }

    equipWeapon(name = 'Shurikan', slot = 0,) {
        let equippedWeapon;
        if (slot === 0) {
            this.leftWeapon = createWeapon(name, this.scene, this);
            equippedWeapon = this.leftWeapon;
            GameManager.weapons.left = name;
        } else if (slot === 1) {
            this.rightWeapon = createWeapon(name, this.scene, this);
            equippedWeapon = this.rightWeapon;
            GameManager.weapons.right = name;
        } else {
            this.aura = createWeapon(name, this.scene, this);
            equippedWeapon = this.aura;
            GameManager.weapons.aura = name;
        }
        if (this.playerUI) {
            this.playerUI.setWeaponIcon(name, slot);
        }
        GameManager.save();
        return equippedWeapon;
    }

    getCurrentPos() {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    makeChatBubble(message) {
        if (!this.chatBubble) {
            this.chatBubble = new ChatBubble(this.scene, this.x, this.y - 100, message);
        } else {
            this.chatBubble.updateMessage(message, this.scene);
        }
        this.network.socket.emit('playerchatRequest', message)
    }
}