import AuraSprite from "../weapons/auraSprite.js";
import ShurikanProjectile from "../weapons/shurikanProjectile.js";
import RankSystem from "./RankSystem.js";
import ChatBubble from "./chatBubble.js";

export default class GhostPlayer extends Phaser.GameObjects.Container {
  constructor(scene, id, x = 0, y = 0,
    data = {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { money: 0, auraLevel: 1 },
    }) {
    super(scene, x, y);
    this.id = id;
    this.myData = data;
    const name = data?.name ?? { text: 'Hunter', color: '#ffffff' };
    const power = data?.power ?? { money: 0, auraLevel: 1 };
    this.money = power.money;
    this.auraLevel = power.auraLevel;
    this.nameText = name.text;
    this.nameColor = name.color;

    this.prevPos = new Phaser.Math.Vector2(x, y);
    this.targetPos = new Phaser.Math.Vector2(x, y);
    this.lerpTimer = 0;
    this.lerpDuration = 33;

    this.ranks = new RankSystem();

    // Add the container itself to the scene's display list
    scene.add.existing(this);
    this.setDepth(8);

    this.createVisuals();
  }

  preUpdate(time, delta) {
    this.lerpPosition(delta);
  }

  createVisuals() {
    // Add auraSprite as a child of the container
    this.auraSprite = new AuraSprite(this.scene, 0, 0, this.auraLevel) // Position (0,0) is container's center
      .setTint(0x00ffff);
    this.auraSprite.setDepth(0); // Lower depth than sprite
    this.add(this.auraSprite);

    // Add sprite as a child of the container
    this.sprite = this.scene.add.sprite(0, 0, 'dudesheet'); // Position (0,0) is container's center
    this.sprite.setScale(0.35);
    this.sprite.setAlpha(0.6);
    this.baseTint = '0x00ffff';
    this.sprite.setTint(0x00ffff);
    this.sprite.setOrigin(0.5, 0.5); // Center the sprite on the container's origin
    this.sprite.setDepth(1); // Higher depth than aura
    this.add(this.sprite);

    const spriteHeight = this.sprite.displayHeight;

    // Add moneyText as a child of the container
    this.moneyText = this.scene.add.text(0, -spriteHeight, this.ranks.getRank(this.money) + '\n' + this.money, {
      fontSize: '12px',
      align: 'center',
      fill: '#00FFFF'
    }).setOrigin(0.5).setDepth(2); // Higher depth than sprite
    this.add(this.moneyText);

    // Add headName as a child of the container
    this.headName = this.scene.add.text(0, -spriteHeight / 1.25, this.nameText, {
      fontSize: '12px',
      align: 'center',
      fill: this.nameColor,
    }).setOrigin(0.5).setDepth(2); // Same depth as money text
    this.add(this.headName);

    // Initialize healthBar graphics object, but don't draw it until updateHealth
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3); // Highest depth for now
    this.add(this.healthBar);
  }

  
  lerpPosition(delta) {
    if (!this.sprite) return;

    this.lerpTimer += delta;

        const t = Phaser.Math.Clamp(this.lerpTimer / this.lerpDuration, 0, 1);
    const lerpedX = Phaser.Math.Linear(this.prevPos.x, this.targetPos.x, t);
    const lerpedY = Phaser.Math.Linear(this.prevPos.y, this.targetPos.y, t);

    this.x = lerpedX;
    this.y = lerpedY;

  }

  setGhostState(state) {
    if (!this.sprite) return;
    const { x, y, f, a, c, j, s, h, t, d } = state;
    if (this.prevX === undefined) {
      this.prevX = x;
      this.prevY = y;
    }
    const epsilon = .5;

    this.xv = x - this.prevX;
    this.yv = y - this.prevY;

    if (Math.abs(this.xv) < epsilon) this.xv = 0;
    if (Math.abs(this.yv) < epsilon) this.yv = 0;

    this.prevX = x;
    this.prevY = y;
    this.lerpTimer= 0;
    this.prevPos.set(this.x, this.y);
    this.targetPos.set(x, y);

    // this.x = x;
    // this.y = y;
    this.sprite.flipX = f;

    if (d) {
      this.sprite.stop();
      this.sprite.setFrame(11);
      return;
    }
    if (t) {
      this.sprite.setTint('0xFF0000');
      this.sprite.stop();
      this.sprite.setFrame(6);
      return;
    } else {
      this.sprite.setTint(this.baseTint);
    }
    if (s && !j) {
      this.sprite.stop();
      this.sprite.setFrame(9); // Slide frame
      return;
    }

    if (c) {
      this.sprite.stop();
      this.sprite.setFrame(6);
      return;
    }

    if (h) {
      this.sprite.stop();
      this.sprite.setFrame(10); // Heal frame
      return;
    }

    if (j) {
      this.sprite.stop();
      this.sprite.setFrame(5); // Jump frame
      return;
    }
    if ((this.xv > 0) || this.xv < 0) {
      this.sprite.play('dudewalk', true);
    } else {
      this.sprite.stop();
      this.sprite.setFrame(0);
    }


    // if (a) {
    //   this.sprite.play(state.anim, true);
    // } else if (state.frame !== undefined) {
    //   this.sprite.setFrame(state.frame);
    // }
  }

  updateName(text, color) {
    this.nameColor = color;
    this.nameText = text;
    this.headName.setText(this.nameText);
    this.headName.setFill(this.nameColor);
  }

  updateHealth(health, max) {
    this.currentHealth = health;
    this.maxHealth = max;

    const percentHealth = Phaser.Math.Clamp(health / max, 0, 1);

    // Ensure health bar exists, it should be created in createVisuals
    if (!this.healthBar) {
      this.healthBar = this.scene.add.graphics().setDepth(3);
      this.add(this.healthBar);
    }

    this.healthBar.clear();

    const spriteHeight = this.sprite.displayHeight / 1.5;
    const healthBarHeight = 5;
    const healthBarWidth = 50;

    // Calculate Y position relative to headName
    const healthBarY = -spriteHeight;
    const healthBarX = -healthBarWidth / 2; // Centered

    // Background
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Foreground
    this.healthBar.fillStyle(0x00FF00, 1);
    this.healthBar.fillRect(healthBarX, healthBarY, healthBarWidth * percentHealth, healthBarHeight);
  }

  updatePower(money, auraLevel) {
    this.money = money;
    this.auraLevel = auraLevel;
    this.auraSprite.setAuraLevel(this.auraLevel);
    this.moneyText.setText(this.ranks.getRank(this.money) + '\n' + this.money);
  }

  syncAll(x, y, data) {
    this.myData = data;
    const power = data.power || { money: 0, auraLevel: 1 };
    const name = data.name || { text: 'Hunter', color: '#FFFFFF' };

    this.updateName(name.text, name.color);
    this.updatePower(power.money, power.auraLevel);

    this.x = x;
    this.y = y;
  }

  getSyncData() {
    return {
      x: this.x,
      y: this.y,
      data: this.myData, // should include name, power, etc.
    };
  }


  // destroy() {
  //     // When destroying the container, all its children are automatically destroyed
  //     // if they were added using this.add() and not directly to the scene.
  //     this.removeAll(true); // Ensures children are destroyed
  //     super.destroy(); // Destroys the container itself
  // }

  ghostShurikan(shotInfo) {
    const { start, direction } = shotInfo;
    const speed = 1000;

    const velocity = new Phaser.Math.Vector2(direction.x, direction.y).scale(speed);

    // const shurikan = this.scene.physics.add.sprite(start.x, start.y, 'shurikan');
    // shurikan.setScale(0.15);
    // shurikan.setAlpha(0.6);
    // shurikan.setTint(0x00ffff);
    // shurikan.body.allowGravity = false;
    // shurikan.setVelocity(velocity.x, velocity.y);

    // this.scene.tweens.add({
    //   targets: shurikan,
    //   angle: 360,
    //   duration: 500,
    //   repeat: -1,
    //   ease: 'Linear',
    // });

    // this.scene.time.delayedCall(1000, () => {
    //   if (shurikan && shurikan.body) {
    //     shurikan.destroy();
    //   }
    // });
    const shurikan = new ShurikanProjectile(this.scene, start.x, start.y, this.scene.player, null, 2, 1, 3);
    shurikan.setVelocity(velocity.x, velocity.y);
    shurikan.setAlpha(.5);
  }

  makeChatBubble(message) {
    if (!this.chatBubble) {
      this.chatBubble = new ChatBubble(this.scene, 0, -this.sprite.displayHeight / 2 - 60, message);
      this.add(this.chatBubble); // Add chat bubble as a child
      this.chatBubble.setDepth(4);
    } else {
      this.chatBubble.updateMessage(message, this.scene);
    }
  }
}