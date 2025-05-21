
export default class GhostPlayer {
  constructor(scene, id, x = 400, y = 300) {
    this.scene = scene;
    this.id = id;

    this.sprite = scene.add.sprite(x, y, 'dude');
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00ffff); // cyan ghost color
    this.sprite.setDepth(1);

    // Optional: Add name tag
    this.nameText = scene.add.text(x, y - 40, `Player ${id}`, {
      fontSize: '12px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  updatePosition(x, y) {
    this.sprite.setPosition(x, y);
    this.nameText.setPosition(x, y - 40);
  }

  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
  }
}
