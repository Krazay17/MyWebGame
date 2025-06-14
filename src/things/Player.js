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
        this.body.setMaxVelocity(1000, 850);


        this.setupAnimation();
        this.syncNetwork(x, y)

        this.lastSentState = {};

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
        this.dashSpeed = 900;
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
            if (this.scene.scene.key !== 'Home' && this.body.blocked.down && !this.playerUI.Chatting || !this.alive) {
                this.scene.scene.start('Home')
            }
        });

        // this.playerUI.on('chatting', () => {
        //     this.chatting = true;
        // })
        // this.playerUI.on('doneChatting', () => {
        //     this.chatting = false;
        // })
        // this.scene.input.keyboard.on('keydown-R', () => {
        //     if (!this.playerUI.Chatting) {
        //         this.Died();
        //         this.scene.scene.restart();
        //     }
        // });


        this.setupStates();
        this.resetJump();
        this.setStats();
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
        let prevY = this.y;

        // After update:
        if (this.body.velocity.y > 700 && this.body.blocked.down) {
            this.y = Math.min(this.y, prevY); // crude correction
            this.body.velocity.y = 0;
        }

        if (!this.isCrouch) {
            this.lerpHitBox(delta);
        }
    }

    setStats() {
        this.healthMax = GameManager.stats.healthMax ?? 25;
        this.health = GameManager.stats.health ?? 25;
        this.emit('updateHealth', this.health, this.healthMax);
        this.network.socket.emit('updateHealth', this.health, this.healthMax);
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

    // touchWall(player, platform) {
    //     if (this.body.blocked.down) {
    //         this.resetJump();
    //         this.resetDash();
    //     }

    //     if (this.body.blocked.left || this.body.blocked.right) {
    //         this.resetJump(200);
    //         this.wallJumpX = this.body.blocked.left ? 400 : -400;
    //         this.wallJump = true;
    //         this.setMaxVelocity(1000, 50);

    //         console.log('touching wall')

    //         if (this.dashTween) {
    //             this.dashTween.stop();
    //             this.isDashing = false;
    //         }
    //     }
    // }

    touchFireWall(wall) {
        // const tileWorldX = wall.getCenterX();
        // const tileWorldY = wall.getCenterY();
        // const rawDirection = new Phaser.Math.Vector2(this.x - tileWorldX, this.y - tileWorldY);
        // const angle = Phaser.Math.Snap.To(rawDirection.angle(), Phaser.Math.DegToRad(90)); // Snap to 90°
        // const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
        // this.knockbackVelocity = direction.scale(50);
        // const velocity = direction.scale(600);
        // this.TakeDamage(velocity.x, velocity.y, 5, 300);

        const x = this.body.blocked.left ? 1 : this.body.blocked.right ? -1 : 0;
        const y = this.body.blocked.down ? -1 : this.body.blocked.up ? 1 : 0;
        this.TakeDamage(x * 600, y * 600, 5, 300);


    }

    handleInput(delta) {
        if (!this.stunned && this.alive && !this.chatting) {

            const input = this.getInput();
            if (input.left && !input.right) {
                this.flipX = true;
                this.dir = -1;
            } else if (input.right && !input.left) {
                this.flipX = false;
                this.dir = 1;
            }

            this.decideState(input);       // decide what state to be in based on input
            this.states[this.currentState].update(delta, input); // update current state logic
            if ((this.slamCD || this.slideCD) && !this.isSliding && !this.isCrouch) {
                this.slideCD = Math.max(0, this.slideCD -= delta);
                this.slamCD = Math.max(0, this.slamCD -= delta);
            }
        }

        this.animChooser(delta);
    }

    decideState(input) {
        const { left, right, jump, dash, crouch, heal, slam } = input;

        if (dash && this.canDash) return this.setState('dash', input);
        if (heal) return this.setState('heal');
        if (jump && this.canJump) return this.setState('jump', input);
        if ((slam && !this.slamCD && !this.body.blocked.down)) return this.setState('slam', input);
        if ((crouch)) return this.setState('crouch', input);
        if (!this.body.blocked.down) return this.setState('fall', input);
        if (left || right) return this.setState('walk', input);
        return this.setState('idle', input);
    }

    getInput() {
        return {
            left: this.controls.left.isDown,
            right: this.controls.right.isDown,
            jump: this.controls.jump.isDown,
            dash: this.controls.dash.isDown,
            crouch: this.controls.down.isDown,
            heal: this.controls.up.isDown,
            slam: Phaser.Input.Keyboard.JustDown(this.controls.down),
        };
    }

    setState(newState, input) {
        if (this.scene.time.now < this.stateLockout) return;
        if (newState === this.currentState) return;

        if (newState === 'idle' && !this.body.blocked.down) {
            newState = 'fall';
        }
        this.states[this.currentState].exit();
        this.currentState = newState;
        this.states[this.currentState].enter(input);
        console.log(this.currentState);
    }

    walkLerp(delta, a, modify) {
        if (!modify) modify = this.body.blocked.down ? .5 : .06;

        modify = Phaser.Math.Clamp(modify * (delta / 16.666), 0, 1);
        return Phaser.Math.Linear(this.body.velocity.x, a, modify);
    }

    setupStates() {
        this.currentState = 'idle';
        this.stateLockout = 0;
        this.slideCD = 0;
        this.slamCD = 0;
        this.healCD = 0;
        // idle: {
        //     enter: () => { },
        //     update: () => { },
        //     exit: () => { },
        // },

        function lerp(start, end, t) {
            return start + (end - start) * t;
        }

        this.states = {
            idle: {
                enter: () => {
                    this.resetJump();
                    this.tryUncrouch();
                    this.isSlamming = 0;
                },
                update: (delta) => {
                    this.setVelocityX(this.walkLerp(delta, 0));
                },
                exit: () => { },
            },

            walk: {
                enter: () => {
                    this.resetJump();
                    this.tryUncrouch();
                    this.isSlamming = 0;
                    this.isWalking = true;
                },
                update: (delta, input) => {
                    const { left, right } = input;
                    const dir = this.speed * this.dir;
                    this.tryUncrouch();

                    this.setVelocityX(this.walkLerp(delta, dir));
                },
                exit: () => {
                    this.isWalking = false;
                },
            },

            fall: {
                enter: () => {
                    this.canJump = false;
                    this.falling = true;
                },
                update: (delta, input) => {
                    const { left, right, jump } = input;
                    const dir = (left ? -1 : right ? 1 : 0) * (this.speed);
                    this.tryUncrouch();

                    if (this.body.velocity.y >= 0) {
                        this.reachApex = true;
                    }
                    if ((left && !right) || (!left && right)) {
                        this.setVelocityX(this.walkLerp(delta, dir, .075));
                    } else {
                        this.setVelocityX(this.walkLerp(delta, 0, .02));
                    }

                    if (this.body.blocked.left) {
                        this.bufferLeftWallJump = this.scene.time.now + 55;
                        this.isWallJumping = false;
                        this.wallRunRight = 540;
                    }

                    if (this.body.blocked.right) {
                        this.bufferRightWallJump = this.scene.time.now + 55;
                        this.isWallJumping = false;
                        this.wallRunLeft = 540;
                    }

                    if (!jump || (!this.body.blocked.right && !this.body.blocked.left)) {
                        this.wallRunning = false;
                        this.wallSlide = false;
                        this.setMaxVelocity(1000, 850);

                    } else if (!this.wallRunLeft || !this.wallRunRight) {
                        this.wallSlide = true;
                        this.wallRunning = false;
                        this.setMaxVelocity(1000, 200);
                    }

                    if (jump) {
                        if (!right && (this.bufferRightWallJump > this.scene.time.now) && !this.isWallJumping) {
                            this.setVelocity(-350, Phaser.Math.Clamp(-this.wallRunRight, -500, -250));
                            this.isWallJumping = true;
                            this.flipX = true;
                            this.bufferRightWallJump = 0;
                            this.wallRunning = false;
                            this.wallJumpTimer = this.scene.time.now;
                            this.wallRunRight /= 4;
                            this.isMantling = 0;
                            console.log(this.wallRunRight);
                        }
                        if (!left && (this.bufferLeftWallJump > this.scene.time.now) && !this.isWallJumping) {
                            this.setVelocity(350, Phaser.Math.Clamp(-this.wallRunLeft, -500, -250));
                            this.isWallJumping = true;
                            this.flipX = false;
                            this.bufferLeftWallJump = 0;
                            this.wallRunning = false;
                            this.wallJumpTimer = this.scene.time.now;
                            this.wallRunLeft /= 4;
                            this.isMantling = 0;
                            console.log(this.wallRunLeft);
                        }

                        if (this.wallRunLeft && this.body.blocked.left) {
                            if (this.wallRunLeft < (-this.body.velocity.y)) {
                                this.wallRunLeft = (-this.body.velocity.y)
                            }
                            this.setVelocityY(-this.wallRunLeft);
                            this.wallRunLeft = Math.max(0, this.wallRunLeft -= delta * 1.3);
                            this.wallRunning = true;

                            if (this.body.blocked.up) {
                                this.wallRunLeft = 0;
                                this.wallRunning = false;
                            }
                        } else if ((left && !right) && (this.bufferLeftWallJump > this.scene.time.now) && this.wallRunLeft && !this.isWallJumping) {
                            this.setVelocity(-25);
                            this.isMantling = this.scene.time.now;
                        }

                        if (this.wallRunRight && this.body.blocked.right) {
                            if (this.wallRunRight < (-this.body.velocity.y)) {
                                this.wallRunRight = (-this.body.velocity.y)
                            }
                            this.setVelocityY(-this.wallRunRight);
                            this.wallRunRight = Math.max(0, this.wallRunRight -= delta * 1.3);
                            this.wallRunning = true;

                            if (this.body.blocked.up) {
                                this.wallRunRight = 0;
                                this.wallRunning = false;
                            }
                        } else if ((right && !left) && (this.bufferRightWallJump > this.scene.time.now) && this.wallRunRight && !this.isWallJumping) {
                            this.setVelocityY(-25);
                            this.isMantling = this.scene.time.now;
                        }
                    }
                },
                exit: () => {
                    this.falling = false;
                    this.isMantling = false;
                    this.wallRunning = false;
                    this.wallSlide = false;
                    this.setMaxVelocity(1000, 850);
                },
            },

            wallRun: {
                enter: () => { },
                update: () => { },
                exit: () => { },
            },

            wallJump: {
                enter: () => { },
                update: () => { },
                exit: () => { },
            },

            crouch: {
                enter: (input) => {
                    const { left, right } = input;
                    this.isCrouch = true;
                    this.hitBoxSize = { y: 180, yo: 70 };
                    this.setSize(115, 180);
                    this.setOffset(70, 70);

                    if (this.body.blocked.down && (!left && !right)) {
                        this.slideCD = 1;
                    }

                    this.stop();
                    this.setFrame(6);
                },
                update: (delta, input) => {
                    const { left, right, crouch } = input;
                    const move = (left ? -1 : right ? 1 : 0) * (this.speed);

                    if (this.body.blocked.down) {
                        this.resetJump();
                        this.isSlamming = 0;

                        if ((left || right) && !this.slideCD) {
                            this.setState('slide');
                            return;
                        }
                    }

                    this.setVelocityX(this.walkLerp(delta, move * 0.33, .03));
                },
                exit: () => {
                },
            },

            slam: {
                enter: (input) => {
                    this.isSlamming = this.scene.time.now;
                    const { left, right } = input;
                    const move = (left ? -1 : right ? 1 : 0) * (this.speed);
                    this.slamCD = 800;
                    this.setVelocity(move * 1.125, Math.max(350, this.body.velocity.y));
                },
                update: () => { },
                exit: () => { },
            },

            slide: {
                enter: () => {
                    const speed = 550 * this.dir;

                    this.isSliding = true;
                    this.canSlide = false;
                    this.setVelocityX(speed);

                    this.slideCD = 800;
                    this.slideTime = this.scene.time.now + 500;
                    this.stateLockout = this.slideTime;

                    this.stop();
                    this.setFrame(9);
                },
                update: (delta, input) => {
                    if (!input.crouch) {
                        this.stateLockout = 0;
                        this.setState('idle');
                        return;
                    }

                    if (input.jump && this.canJump) {
                        this.stateLockout = 0;
                        this.setState('jump', input);
                        return;
                    }

                    if (this.slideTime <= this.scene.time.now && input.crouch) {
                        this.stateLockout = 0;
                        this.setState('crouch');
                        return;
                    }


                    if (input.dash && this.canDash) {
                        this.stateLockout = 0;
                        this.setState('dash', input);
                        return;
                    }
                },
                exit: () => {
                    this.isSliding = false;
                },
            },

            jump: {
                enter: (input) => {
                    this.isJumping = true;
                    this.reachApex = false;
                    this.jumpPower = 200;
                    this.jumpMax = 425;
                    this.isSlamming = 0;
                    this.setVelocityY(-this.jumpPower);
                    this.tryUncrouch();

                    this.stop();
                    this.setFrame(5);
                },
                update: (delta, input) => {
                    const { left, right, jump } = input;
                    const move = (left ? -1 : right ? 1 : 0) * this.speed;
                    this.setVelocityY(-this.jumpPower);
                    this.setVelocityX(this.walkLerp(delta, move, .2))
                    this.jumpPower += delta * 1.5;

                    if (this.jumpPower >= this.jumpMax) {
                        this.canJump = false;
                    }
                },
                exit: () => {
                    this.isJumping = false;
                },
            },

            dash: {
                enter: () => {
                    this.dashDuration = 250;
                    this.stateLockout = this.scene.time.now + this.dashDuration;

                    this.canDash = false;
                    this.canResetDash = false;
                    this.isDashing = true;
                    this.iFrame = true;
                    this.body.setAllowGravity(false);
                    this.tryUncrouch();

                    this.dashTime = 0;
                    this.startDash = this.dashSpeed * this.dir;
                    this.endDash = this.startDash / 3;

                    this.scene.time.addEvent({
                        delay: 650,
                        callback: () => {
                            this.canResetDash = true;
                            if (this.queResetDash) this.resetDash();
                        }
                    });

                    this.stop();
                    this.setFrame(11);
                    this.clearTint();
                },
                update: (delta) => {
                    this.dashTime += delta;

                    const t = Phaser.Math.Clamp((this.dashTime * 2) / this.dashDuration, 0, 1);
                    const currentSpeed = lerp(this.startDash, this.endDash, t)
                    this.setVelocityX(currentSpeed);
                    this.setVelocityY(0);

                    if (this.body.blocked.left || this.body.blocked.right) {
                        this.stateLockout = 0;
                        this.setState('idle');
                    }
                },
                exit: () => {
                    this.body.setAllowGravity(true);
                    this.isDashing = false;
                    this.iFrame = false;
                },
            },

            heal: {
                enter: () => {
                    this.isHealing = true;
                    this.setMaxVelocity(100, 100);
                    this.tryUncrouch();
                },
                update: (delta, input) => {
                    const { left, right } = input;
                    const move = (left ? -1 : right ? 1 : 0) * (this.speed);
                    this.setVelocityX(this.walkLerp(delta, move))
                    this.healCD += delta / 250;

                    if (this.healCD >= 1) {
                        if (this.health >= this.healthMax) return;
                        this.healCD = 0;
                        this.health++;
                        GameManager.stats.health = this.health;
                        this.updateMoney(-1);
                        this.emit('updateHealth', this.health, this.healthMax);
                        this.network.socket.emit('updateHealth', this.health, this.healthMax);
                    }
                },
                exit: () => {
                    this.isHealing = false;
                    this.setMaxVelocity(1000, 850);
                },
            },
        }
    }

    resetJump(dash = true) {
        this.canJump = true;
        this.wallRunLeft = 540;
        this.wallRunRight = 540;
        this.reachApex = true;

        if (!dash) return;
        if (this.canResetDash) {
            this.queResetDash = false;
            this.canDash = true;
            this.setTint(0x66ff33);
        } else {
            this.queResetDash = true;
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

    animChooser(delta) {
        const state = {
            x: this.x,
            y: this.y,
            f: this.flipX ? 1 : 0,
            a: this.anims?.currentAnim?.key || '',
            c: this.isCrouch ? 1 : 0,
            j: !this.body.blocked.down ? 1 : 0,
            jp: this.isJumping ? 1 : 0,
            s: this.isSliding ? 1 : 0,
            h: this.isHealing ? 1 : 0,
            t: this.stunned ? 1 : 0,
            d: this.isDashing ? 1 : 0,
            w: this.isWalking ? 1 : 0,
            wj: this.wallJumpTimer > (this.scene.time.now - 200) ? 1 : 0,
            wr: this.wallRunning ? 1 : 0,
            ws: this.wallSlide ? 1 : 0,
            slam: this.isSlamming > (this.scene.time.now - 550) ? 1 : 0,
            m: this.isMantling > (this.scene.time.now - 200) ? 1 : 0,
            dead: !this.alive ? 1 : 0,

        };
        this.syncGhost(delta, state);

        const { x, y, f, a, c, j, jp, s, h, t, d, w, wj, wr, ws, slam, m, dead } = state;

        if (dead) {
            this.stop();
            this.setFrame(22);
            return;
        }

        if (t) {
            this.stop();
            this.setFrame(16);
            return;
        }

        if (wj) {
            this.play('dudetwist', true);
            return;
        }

        if (m) {
            this.play('dudemantle', true);
            return;
        }

        if (wr) {
            this.play('dudeclimb', true);
            return;
        }

        if (ws) {
            this.stop();
            this.setFrame(12);
            return;
        }

        if (d) {
            this.stop();
            this.setFrame(11);
            return;
        }

        if (s && !j) {
            this.stop();
            this.setFrame(9);
            return;
        }

        if (slam) {
            this.stop();
            this.setFrame(15);
            return;
        }

        if (jp) {
            this.play('dudejump', true);
            return;
        }

        if (c) {
            this.stop();
            this.setFrame(6);
            return;
        }

        if (h) {
            this.stop();
            this.setFrame(10);
            return;
        }


        if (j) {
            this.stop();
            this.setFrame(5);
            return;
        }

        if (w) {
            this.play('dudewalk', true);
        } else {
            this.stop();
            this.setFrame(0);
        }
    }

    syncGhost(delta, state) {
        if (!this.network?.socket) return;

        this.statSyncTimer = (this.statSyncTimer || 0) + delta;

        if (this.statSyncTimer < 15) return;

        this.statSyncTimer = 0;

        // const state = {
        //     x: this.x,
        //     y: this.y,
        //     f: this.flipX ? 1 : 0,
        //     a: this.anims?.currentAnim?.key || '',
        //     c: this.isCrouch ? 1 : 0,
        //     j: !this.body.blocked.down ? 1 : 0,
        //     s: this.isSliding ? 1 : 0,
        //     h: this.isHealing ? 1 : 0,
        //     t: this.stunned ? 1 : 0,
        //     d: this.isDashing ? 1 : 0,
        // };

        if (!this.hasStateChanged(state, this.lastSentState)) return;

        this.lastSentState = { ...state };

        this.network.socket.emit('playerStateRequest', state);
    }

    hasStateChanged(newState, oldState) {
        for (let key in newState) {
            if (newState[key] !== oldState[key]) {
                return true;
            }
        }
        return false;
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

        this.makeScreenFlash();
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
                this.setFrame(5);
            }
        });

        this.setVelocityX(x);
        this.setVelocityY(y);

        this.updateMoney(-damage);

        return true;
    }

    resetDash() {
        if (this.canResetDash && !this.stunned) {
            this.queResetDash = false;
            this.canDash = true;
            this.setTint(0x66ff33);
        } else {
            this.queResetDash = true;
        }
    }

    dash(x) {
        this.iFrame = true;
        this.canDash = false;
        this.canResetDash = false;
        this.isDashing = true;
        this.stop();
        this.setFrame(11);

        //this.setVelocityX(x);
        let vel = { x: x }; // start at high speed

        this.dashTween = this.scene.add.tween({
            targets: vel,
            x: x / 3,           // lower target speed
            duration: 200,
            ease: 'Power1',
            onUpdate: () => {
                this.body.setVelocity(vel.x, 0); // apply it each frame
            },
            onComplete: () => {
                this.isDashing = false;
            }
        });

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

        if (!this.scene.anims.get('dudeclimb')) {
            this.scene.anims.create({
                key: 'dudeclimb',
                frames: this.anims.generateFrameNumbers('dudesheet', { start: 12, end: 14 }),
                frameRate: 11,
                yoyo: true,
                repeat: -1,
            });
        }

        if (!this.scene.anims.get('dudemantle')) {
            this.scene.anims.create({
                key: 'dudemantle',
                frames: [
                    { key: 'dudesheet', frame: 16, duration: 50 },
                    { key: 'dudesheet', frame: 17, duration: 100 },
                    { key: 'dudesheet', frame: 16, duration: 50 },
                ],
            });
        }
        if (!this.scene.anims.get('dudejump')) {
            this.scene.anims.create({
                key: 'dudejump',
                frames: [
                    { key: 'dudesheet', frame: 7, duration: 100 },
                    { key: 'dudesheet', frame: 2, duration: 100 },
                    { key: 'dudesheet', frame: 5, duration: 100 },
                ],
            });
        }
        if (!this.scene.anims.get('dudetwist')) {
            this.scene.anims.create({
                key: 'dudetwist',
                duration: 200,
                frames: [
                    { key: 'dudesheet', frame: 17 },
                    { key: 'dudesheet', frame: 18 },
                    { key: 'dudesheet', frame: 19 },
                    { key: 'dudesheet', frame: 20 },
                    { key: 'dudesheet', frame: 21 },
                ],
            });
        }


    }

    syncNetwork(x, y) {
        if (this.tryingToSync) return;
        this.tryingToSync = true;
        setTimeout(() => this.tryingToSync = false, 500);

        if (!this.network.socket.connected && !this.network.socket.reconnecting) {
            this.network.socket.connect();
        }

        this.network.socket.emit('playerSyncRequest', {
            x: x, y: y, data: {
                name: GameManager.name,
                power: GameManager.power
            }
        });

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

    makeScreenFlash() {
        const cam = this.scene.cameras.main;
        const screenFlash = this.scene.add.image(cam.centerX, cam.centerY, 'damagescreenflash').setScrollFactor(0).setOrigin(.5);
        screenFlash.setDisplaySize(cam.displayWidth, cam.displayHeight);
        this.setTint('0xFF0000');

        this.scene.add.tween({
            targets: screenFlash,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                if (!this.alive) return;
                screenFlash.destroy();
                if (this.canDash) {
                    this.setTint(0x66ff33);
                } else {
                    this.setTint();
                }
            },
        })
    }

    tryUncrouch() {
        if (!this.isCrouch) {
            return;
        }
        const body = this.body;
        const buffer = 36; // extra safety padding

        // Coordinates at top-left and top-right just above the player
        const leftX = body.x + buffer;
        const rightX = body.right - buffer;
        const checkY = body.y - 25; // just above the head

        const tileLeft = this.scene.walls?.hasTileAtWorldXY(leftX, checkY);
        const tileRight = this.scene.walls?.hasTileAtWorldXY(rightX, checkY);

        if (!tileLeft && !tileRight) {
            this.uncrouch(); // safe to stand
        } else {
            // blocked, do nothing or stay crouched
        }
    }

    uncrouch() {
        if (!this.isCrouch) {
            return;
        }

        this.isCrouch = false;

        // const oldHeight = this.body.height;
        // const newHeight = this.baseHitBoxSize.y;
        // const heightDifference = newHeight - oldHeight;

        // // Shift body up to keep feet fixed
        // this.body.y -= heightDifference;

        // this.setSize(115, newHeight);
        // this.setOffset(70, this.baseHitBoxSize.yo);

        // // Force immediate collision resolution with the floor
        // this.scene.physics.world.collide(this, this.scene.walls);

        // this.body.updateFromGameObject();
    }


}