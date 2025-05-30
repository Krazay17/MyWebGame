import AuraSprite from "../weapons/auraSprite.js";
import RankSystem from "./RankSystem.js";

export default class GhostPlayer {
  constructor(scene, id, x = 0, y = 0,
    data = {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { source: 0, auraLevel: 1 },
    }) {
    this.scene = scene;
    this.id = id;
    const name = data?.name ?? { text: 'Hunter', color: '#ffffff' };
    const power = data?.power ?? { source: 0, auraLevel: 1 };
    this.x = x;
    this.y = y;
    this.source = power.source;
    console.log('data object', data)
    this.auraLevel = power.auraLevel;
    this.nameText = name.text;
    this.nameColor = name.color;

    this.ranks = new RankSystem();
    this.createVisuals();
  }

  createVisuals() {
    this.auraSprite = new AuraSprite(this.scene, this.x, this.y, this.auraLevel)
      .setTint(0x00ffff);

    this.sprite = this.scene.add.sprite(this.x, this.y, 'dudesheet');
    this.sprite.setScale(0.3);
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00ffff);


    this.sourceText = this.scene.add.text(this.x, this.y - 45, this.ranks.getRank(this.source) + '\n' + this.source, {
      fontSize: '12px',
      align: 'center',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.headName = this.scene.add.text(this.x, this.y - 65, this.nameText, {
      fontSize: '12px',
      align: 'center',
      fill: this.nameColor,
    }).setOrigin(0.5);

    // this.nameText2 = this.scene.add.text(this.x, this.y - 40, this.source + '\n' + this.ranks.getRank(this.source), {
    //   fontSize: '12px',
    //   align: 'center',
    //   fill: '#ffffff'
    // }).setOrigin(0.5);
  }

  updatePosition(x, y) {
    const sameX = Math.abs(this.x - x) < 0.05;
    const sameY = Math.abs(this.y - y) < 0.05;

    // Avoid processing duplicate position updates
    if (sameX && sameY) return;

    this.ghostVelocity(x, y);
    this.x = x;
    this.y = y;
    if (this.sprite) this.sprite.setPosition(x, y);
    if (this.sourceText) this.sourceText.setPosition(x, y - 45);
    if (this.headName) this.headName.setPosition(x, y - 65);
    if (this.auraSprite) this.auraSprite.setPosition(x, y);
  }

  updateScene(newScene) {
    this.scene = newScene;

    this.destroy();

    // Recreate visuals in new scene
    this.createVisuals();

    // Restore position
    this.updatePosition(this.x, this.y);
  }

  updateName(text, color) {
    this.nameColor = color;
    this.nameText = text;
    this.headName.setText(this.nameText);
    this.headName.setFill(this.nameColor);
  }

  updatePower(source, auraLevel) {
    this.source = source;
    this.auraLevel = auraLevel;
    this.auraSprite.setAuraLevel(this.auraLevel);
    this.sourceText.setText(this.ranks.getRank(this.source) + '\n' + this.source);
  }

  syncAll(x, y, data) {
    const power = data.power || { source: 0, auraLevel: 1 }
    this.updatePosition(x, y);
    this.updatePower(power.source, power.auraLevel);
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.sourceText) this.sourceText.destroy();
    if (this.headName) this.headName.destroy();

  }

  ghostVelocity(x, y) {
    this.xv = this.x - x;
    this.yv = this.y - y;
    const epsilon = 1;

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

  ghostShurikan(x, y, d) {
    const speed = 1000;

    // Convert plain object to Vector2 (in case it's from network)
    const direction = new Phaser.Math.Vector2(d.x, d.y).normalize();
    const velocity = direction.scale(speed);

    // Add shurikan as a physics sprite
    const shurikan = this.scene.physics.add.sprite(x, y, 'shurikan');
    shurikan.setScale(0.15);
    shurikan.setAlpha(0.6);
    shurikan.setTint(0x00ffff);

    // Disable gravity if needed (optional)
    shurikan.body.allowGravity = false;

    // Set velocity
    shurikan.setVelocity(velocity.x, velocity.y);

    // Optional: add spin animation
    this.scene.tweens.add({
      targets: shurikan,
      angle: 360,
      duration: 500,
      repeat: -1,
      ease: 'Linear',
    });

    // Auto-destroy after time (e.g., 1 sec)
    this.scene.time.delayedCall(1000, () => {
      shurikan.destroy();
    });
  }
}