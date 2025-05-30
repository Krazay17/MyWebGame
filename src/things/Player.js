import GameManager from "./GameManager.js";
import NetworkManager from "./NetworkManager.js";
import RankSystem from "./RankSystem.js";
import { createWeapon } from "../weapons/WeaponManager.js"
import ChatBubble from "./chatBubble.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dudesheet');

        GameManager.load();
        this.network = NetworkManager.instance;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setMaxSpeed(1400);

        this.setupAnimation();

        this.damageSound = this.scene.sound.add('playerHit');

        this.setScale(0.3);
        this.setSize(105, 240);
        this.setOffset(55, 5);
        this.alive = true;
        this.health = 5;
        this.deathPenalty;
        this.source = GameManager.power.source;
        this.auraLevel = GameManager.power.auraLevel;
        this.name = GameManager.name;

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

        this.equipWeapon(GameManager.weapons.left, 0);
        this.equipWeapon(GameManager.weapons.right, 1);
        this.equipWeapon('zap', 2)
        this.weapons = [this.leftWeapon, this.rightWeapon];

        this.tryLeftAttack = false;
        this.canLeftAttack = true;
        this.canRightAttack = true;
        this.leftSpam = 0;
        this.rightSpam = 0;
        this.speed = 250;


        this.rankSystem = new RankSystem();

        this.controls = {
            up: [scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
            scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false)
            ],
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
            dash: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false)

        };
        this.myPointer = new Phaser.Input.Pointer(this.scene.input.manager, 1)

        this.scoreText = this.scene.add.text(10, 150, 'Source: ' + GameManager.power.source + '\n' + this.rankSystem.getRank(GameManager.power.source), {
            fontSize: '32px',
            color: '#4fffff'
        });
        this.scoreText.setScrollFactor(0);

        this.scene.input.on('pointerdown', (pointer) => {
            if (GameManager.flags.devMode && pointer.middleButtonDown()){
            const worldPos = pointer.positionToCamera(this.scene.cameras.main);
            this.setPosition(worldPos.x, worldPos.y);
            this.setVelocity(0);
            }
        });
        this.scene.input.keyboard.on('keydown-F', () => {
            if (GameManager.flags.devMode) {
                this.updateSource(500);
            }
        });
        this.scene.input.keyboard.on('keydown-G', () => {
            if (GameManager.flags.devMode) {
                this.tryIncreaseAura(true)
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
            if (this.scene.scene.key !== 'Home' && this.body.touching.down && !this.playerUI.Chatting) {
                this.scene.scene.start('Home')
            }
        });
        this.scene.input.keyboard.on('keydown-R', () => {
            if (!this.playerUI.Chatting) {
                this.Died();
                this.scene.scene.restart();
            }
        });

        this.resetJump(true);

        this.scene.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                this.syncNetwork();
            }
        })

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if(this.aura) this.aura.update?.(delta);
        if(this.chatBubble) this.chatBubble.setPosition(this.x, this.y -100);

        if (this.alive && !this.stunned && this.leftWeapon && this.rightWeapon) {
            this.leftWeapon.update?.(delta);
            this.rightWeapon.update?.(delta);

            const pointer = this.scene.input.activePointer;

            if (pointer.leftButtonDown() && !this.inventory.visible) {
                this.leftWeapon.fire(pointer);
            }
            if (pointer.rightButtonDown() && !this.inventory.visible) {
                this.rightWeapon.fire(pointer);
            }

            if (this.y > this.scene.physics.world.bounds.height + this.body.height + 150 && this.alive) {
                this.Died();
            }
        }
    }

    Died() {
        if (this.alive == false) return;
        this.alive = false;

        this.deathPenalty = Math.floor(-GameManager.power.source / 2);
        this.updateSource(this.deathPenalty);

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
        this.scene.time.delayedCall(2000, () => this.scene.scene.restart());
        this.emit('playerdied');

        GameManager.save();
    }


    TouchPlatform(player, platform) {
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

    getWeaponGroup() {
        return this.weapons;
    }

    handleInput(delta) {
        if (this.stunned || !this.alive) return;

        const { left, right, down, up, dash } = this.controls;

        const isDown = down.isDown
        const isLeft = left.isDown
        const isRight = right.isDown
        const isUp = up.some(key => key.isDown);

        const WalkLerp = (a, modify) => {
            if (!modify) modify = this.body.touching.down ? .5 : .09;

            modify = Phaser.Math.Clamp(modify * (delta / 16.666), 0, 1);
            return Phaser.Math.Linear(this.body.velocity.x, a, modify);
        };

        if (isLeft && !isDown && !this.playerUI.Chatting) {
            this.setVelocityX(WalkLerp(-this.speed));
            this.flipX = true;
            if (this.body.touching.down) {
                this.anims.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(-600);
            }
        } else if (isRight && !isDown && !this.playerUI.Chatting) {
            this.setVelocityX(WalkLerp(this.speed));
            this.flipX = false;
            if (this.body.touching.down) {
                this.anims.play('dudewalk', true);
            } else {
                this.setFrame(5);
            }
            if (dash.isDown && this.canDash) {
                this.Dash(600);
            }
        } else if (isDown && !this.playerUI.Chatting) {
            this.setVelocityX(WalkLerp(0, 0.01));
        } else {
            this.setVelocityX(WalkLerp(0));
            this.stop();
            if (this.body.touching.down) this.setFrame(0);
            else this.setFrame(2);
        }



        if (isUp && this.canJump && !this.playerUI.Chatting) {
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

        if (isDown && !this.isCrouch && !this.playerUI.Chatting) {
            this.isCrouch = true;
            this.stop();
            this.setTexture('dudecrouch', false);
            this.setSize(105, 140);
            this.setOffset(55, 105);
        } else if (!isDown && this.isCrouch) {
            this.isCrouch = false;
            this.setTexture('dudesheet');
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

    TakeDamage(x, y, damage) {
        if (this.iFrame) return false;
        if (this.hitCD) return false;

        this.hitCD = true;
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.hitCD = false;
            }
        });

        if (this.damageSound) {
            if (this.damageSound.isPlaying)
                this.damageSound.stop();
            this.damageSound.play();
        }

        this.stunned = true;
        this.emit('playerstunned');
        this.scene.time.removeEvent(this.stunTimer);
        this.stunTimer = this.scene.time.addEvent({
            delay: 300,
            callback: () => {
                this.stunned = false;
            }
        });

        this.setVelocityX(x);
        this.setVelocityY(y);

        this.health -= damage;
        this.updateSource(-1);

        return true;
    }

    Dash(x) {
        this.iFrame = true;

        this.setVelocityX(x);
        this.setVelocityY(-50);
        this.canDash = false;
        this.clearTint();

        this.scene.time.addEvent({
            delay: 350,
            callback: () => {
                this.iFrame = false;
            }
        });
    }

    CarryPlayer(player, floor) {
        player.setVelocityX(floor.body.velocity.x);
    }

    PickupItem(source = 0) {
        if (source > 0) {
            this.updateSource(source);
        }
    }

    updateSource(source) {
        const intSource = Math.floor(source);
        const prevSource = GameManager.power.source;
        GameManager.power.source += intSource;
        GameManager.power.source = Math.max(0, GameManager.power.source);
        GameManager.save();
        this.scoreText.text = 'Source: ' + GameManager.power.source + '\n' + this.rankSystem.getRank(GameManager.power.source);
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

    }

    syncNetwork() {
        //this.network.socket.emit('playerSyncRequest', { x: this.x, y: this.y, source: GameManager.power.source, auraLevel: GameManager.auraLevel });
    }

    equipWeapon(name = 'Shurikan', slot = 0,) {
        var equippedWeapon;
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

    tryIncreaseAura(reset) {
        if (reset) {
            GameManager.power.auraLevel = 1;
            GameManager.save();
            this.aura.setLevel(1);
            return true;
        }

        const cost = this.aura.getCost();

        if (GameManager.power.source >= cost) {
            this.updateSource(-cost);
            GameManager.power.auraLevel++;
            GameManager.save();
            this.aura.setLevel(GameManager.power.auraLevel);
            this.network.socket.emit('playerLevel', GameManager.power);
            return true;
        } else {
            return false;
        };
    }

    getCurrentPos() {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    makeChatBubble(message) {
        if (!this.chatBubble) {
            this.chatBubble = new ChatBubble(this.scene, this.x, this.y, message);
        } else {
            this.chatBubble.updateMessage(message);
        }
        this.network.socket.emit('playerchatRequest', message)
    }
}