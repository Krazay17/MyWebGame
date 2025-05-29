import AuraSprite from "../weapons/auraSprite.js";
import RankSystem from "./RankSystem.js";

export default class GhostPlayer {
  constructor(scene, id, x = 400, y = 300, source, aura) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.source = source;
    this.aura = aura;
    this.ranks = new RankSystem();

    this.createVisuals();
  }

  createVisuals() {
    this.auraSprite = new AuraSprite(this.scene, this.x, this.y)
    .setScale(.3)
    .setAlpha(.6)
    .setTint(0x00ffff);

    this.sprite = this.scene.add.sprite(this.x, this.y, 'dudesheet');
    this.sprite.setScale(0.3);
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00ffff);


    this.nameText = this.scene.add.text(this.x, this.y - 40, this.source + '\n' + this.ranks.getRank(this.source), {
      fontSize: '12px',
      align: 'center',
      fill: '#ffffff'
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
    if (this.nameText) this.nameText.setPosition(x, y - 40);
    if (this.auraSprite) this.auraSprite.setPosition(x, y);
  }

  updateScene(newScene) {
    this.scene = newScene;

    // Destroy old visuals
    if (this.sprite) this.sprite.destroy();
    if (this.nameText) this.nameText.destroy();

    // Recreate visuals in new scene
    this.createVisuals();

    // Restore position
    this.updatePosition(this.x, this.y);
  }

  updateName(source) {
    this.source = source;
    this.nameText.setText(this.source + '\n' + this.ranks.getRank(this.source));
  }

  updateAura(auraLevel) {
    this.auraSprite.updateAura(auraLevel);
  }

  syncAll(x, y, source, auraLevel) {
    this.updatePosition(x, y);
    this.updateName(source);
    this.updateAura(auraLevel);
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.nameText) this.nameText.destroy();
  }

  ghostVelocity(x, y) {
    this.xv = this.x - x;
    this.yv = this.y - y;
    const epsilon = 1;

    if (Math.abs(this.xv) < epsilon) this.xv = 0;
    if (Math.abs(this.yv) < epsilon) this.yv = 0;

    if (this.yv == 0 && this.xv > 0 || this.xv < 0) {
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