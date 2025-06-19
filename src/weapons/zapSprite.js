export default class ZapSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, player, target) {
        super(scene, x, y, 0, 16, 'zap');
        // ...
        this.player = player;
        this.target = target;
        this.setOrigin(0, 0.5);
        //this.updateZapLine();
        this.setVisible(false);

        scene.add.existing(this);

    }

    init(player, target) {
        this.player = player;
        this.target = target;
        this.updateZapLine();
        this.activate();
        this.scene.time.removeEvent(this.deactivateTimer);
        this.deactivateTimer = this.scene.time.delayedCall(200, () => this.deactivate(), this);
    }

    preUpdate(time, delta) {
        if (this.target) {
            this.updateZapLine();
        }
        this.tilePositionX += 10; // in update loop
    }

    deactivate() {
        this.setVisible(false);
        this.setActive(false);
    }

    activate() {
        this.setActive(true);
        this.setVisible(true);
    }

    updateZapLine() {
        if(!this.target) return;
        if(this.target.dead || !this.target.active) {
            this.target = null;
            this.deactivateTimer = this.scene.time.delayedCall(50, () => this.deactivate(), this)
            return;
        }
        const dx = this.target.x - this.player.x;
        const dy = this.target.y - this.player.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        this.setPosition(this.player.x, this.player.y);
        this.setRotation(angle);
        this.displayWidth = length;
    }

}
