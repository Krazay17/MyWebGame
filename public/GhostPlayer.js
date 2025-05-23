import RankSystem from "./RankSystem.js";

export default class GhostPlayer {
  constructor(scene, id, x = 400, y = 300, source) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.source = source;
    this.ranks = new RankSystem();

    this.createVisuals();
  }

  createVisuals() {
    this.sprite = this.scene.add.sprite(this.x, this.y, 'dudesheet');
    this.sprite.setScale(0.3);
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00ffff);

    this.nameText = this.scene.add.text(this.x, this.y - 40, this.source + '\n' + this.ranks.getRank(this.source), {
      fontSize: '12px',
      align: 'center',
      fill: '#ffffff'
    }).setOrigin(0.5);
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

    console.log(this.yv);

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
}

