import AuraSprite from "../weapons/auraSprite.js";
import RankSystem from "./RankSystem.js";
import ChatBubble from "./chatBubble.js";

export default class GhostPlayer extends Phaser.GameObjects.Container {
  constructor(scene, id, x = 0, y = 0,
    data = {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { source: 0, auraLevel: 1 },
    }) {
    super(scene, x, y);
    this.id = id;
    this.myData = data;
    const name = data?.name ?? { text: 'Hunter', color: '#ffffff' };
    const power = data?.power ?? { source: 0, auraLevel: 1 };
    this.source = power.source;
    this.auraLevel = power.auraLevel;
    this.nameText = name.text;
    this.nameColor = name.color;

    this.ranks = new RankSystem();

    // Add the container itself to the scene's display list
    scene.add.existing(this);
    this.setDepth(8);

    this.createVisuals();
    // Initialize health bar state
    //this.updateHealth(this.currentHealth, this.maxHealth);


    const debugRect = this.scene.add.graphics();
    this.add(debugRect);
    debugRect.lineStyle(2, 0xFF0000, 1);

    // Calculate debug rectangle position relative to the main sprite
    const spriteOriginalWidth = 32; // Adjust if your 'dudesheet' frame size is different
    const spriteOriginalHeight = 48; // Adjust if your 'dudesheet' frame size is different
    const spriteScale = 0.35;
    const scaledWidth = spriteOriginalWidth * spriteScale;
    const scaledHeight = spriteOriginalHeight * spriteScale;
    debugRect.strokeRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
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
    this.sprite.setTint(0x00ffff);
    this.sprite.setOrigin(0.5, 0.5); // Center the sprite on the container's origin
    this.sprite.setDepth(1); // Higher depth than aura
    this.add(this.sprite);

    const spriteHeight = this.sprite.displayHeight;

    // Add sourceText as a child of the container
    this.sourceText = this.scene.add.text(0, -spriteHeight / 2 - 20, this.ranks.getRank(this.source) + '\n' + this.source, {
      fontSize: '12px',
      align: 'center',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(2); // Higher depth than sprite
    this.add(this.sourceText);

    // Add headName as a child of the container
    this.headName = this.scene.add.text(0, -spriteHeight / 2 - 40, this.nameText, {
      fontSize: '12px',
      align: 'center',
      fill: this.nameColor,
    }).setOrigin(0.5).setDepth(2); // Same depth as source text
    this.add(this.headName);

    // Initialize healthBar graphics object, but don't draw it until updateHealth
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(3); // Highest depth for now
    this.add(this.healthBar);
  }

  updatePosition(x, y) {
    const sameX = Math.abs(this.x - x) < 0.05;
    const sameY = Math.abs(this.y - y) < 0.05;

    if (sameX && sameY) return;

    this.ghostVelocity(x, y);
    // Set the container's position; all children will move with it automatically
    this.setPosition(x, y);

    // Only adjust chatBubble's relative position if it exists, its absolute position is handled by container
    if (this.chatBubble) {
      this.chatBubble.x = 0; // Center bubble
      this.chatBubble.y = -this.sprite.displayHeight / 2 - 60; // Adjust as needed
    }
  }

  ghostVelocity(x, y) {
    if (!this.sprite) return;
    this.xv = this.x - x;
    this.yv = this.y - y;
    const epsilon = .4;

    if (Math.abs(this.xv) < epsilon) this.xv = 0;
    if (Math.abs(this.yv) < epsilon) this.yv = 0;

    if ((this.yv === 0 && this.xv > 0) || this.xv < 0) {
      this.sprite.play('dudewalk', true);
    } else if (this.yv == 0 && this.xv == 0) {
      this.sprite.stop();
      this.sprite.setFrame(0);
    }

    if (this.xv > 0) {
      this.sprite.flipX = true;
    } else if (this.xv < 0) {
      this.sprite.flipX = false;
    }

    if (this.yv > 0 || this.yv < 0) {
      this.sprite.stop();
      this.sprite.setFrame(5);
    }
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

    const spriteHeight = this.sprite.displayHeight;
    const healthBarHeight = 5;
    const healthBarWidth = 50;
    const paddingAboveName = 5;

    // Calculate Y position relative to headName
    const healthBarY = this.headName.y - paddingAboveName - healthBarHeight;
    const healthBarX = -healthBarWidth / 2; // Centered

    // Background
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Foreground
    this.healthBar.fillStyle(0x00FF00, 1);
    this.healthBar.fillRect(healthBarX, healthBarY, healthBarWidth * percentHealth, healthBarHeight);

    console.log(percentHealth);
  }

  updatePower(source, auraLevel) {
    this.source = source;
    this.auraLevel = auraLevel;
    this.auraSprite.setAuraLevel(this.auraLevel);
    this.sourceText.setText(this.ranks.getRank(this.source) + '\n' + this.source);
  }

  syncAll(x, y, data) {
    this.data = data;
    const power = data.power || { source: 0, auraLevel: 1 };
    const name = data.name || { text: 'Hunter', color: '#FFFFFF' };

    this.updatePosition(x, y);
    this.updateName(name.text, name.color);
    this.updatePower(power.source, power.auraLevel);
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

  ghostShurikan(x, y, d) {
    const speed = 1000;

    const direction = new Phaser.Math.Vector2(d.x, d.y).normalize();
    const velocity = direction.scale(speed);

    const shurikan = this.scene.physics.add.sprite(x, y, 'shurikan');
    shurikan.setScale(0.15);
    shurikan.setAlpha(0.6);
    shurikan.setTint(0x00ffff);
    shurikan.body.allowGravity = false;
    shurikan.setVelocity(velocity.x, velocity.y);

    this.scene.tweens.add({
      targets: shurikan,
      angle: 360,
      duration: 500,
      repeat: -1,
      ease: 'Linear',
    });

    this.scene.time.delayedCall(1000, () => {
      if (shurikan && shurikan.body) {
        shurikan.destroy();
      }
    });
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