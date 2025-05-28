export default class ZapSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, player, target) {
        super(scene, x, y, 0, 16, 'zap');
        // ...
        this.player = player;
        this.target = target;
        this.setOrigin(0, 0.5);

        scene.add.existing(this);

        scene.time.delayedCall(200, () => this.destroy(), this);
    }
    // ...

    preUpdate(time, delta) {
        this.tilePositionX += 10; // in update loop
        this.updateZapLine();
    }

    updateZapLine() {
        const dx = this.target.x - this.player.x;
        const dy = this.target.y - this.player.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        this.setPosition(this.player.x, this.player.y);
        this.setRotation(angle);
        this.displayWidth = length;
    }

}
