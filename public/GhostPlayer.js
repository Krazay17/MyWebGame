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
    this.sprite = this.scene.add.sprite(this.x, this.y, 'dude');
    this.sprite.setScale(0.3);
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00ffff);

    this.nameText = this.scene.add.text(this.x, this.y - 40, this.source + '\n' + this.ranks.getRank(this.source), {
      fontSize: '12px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  updatePosition(x, y) {
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
}
