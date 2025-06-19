export default class ZapSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, player, target) {
        super(scene, x, y, 0, 16, 'zap');
        // ...
        this.player = player;
        this.target = target;
        this.setOrigin(0, 0.5);
        //this.updateZapLine();

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
            this.updateZapLine();
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
    if (this.target && (this.target.dead || !this.target.active)) {
        // Enemy is dead — save last known world position
        this.lastTargetX = this.target.x;
        this.lastTargetY = this.target.y;

        // Clear target so we don't update it anymore
        this.target = null;

        // Start 100ms linger timer
        this.scene.time.removeEvent(this.deactivateTimer);
        this.deactivateTimer = this.scene.time.delayedCall(100, () => this.deactivate(), this);
    }

    let targetX, targetY;

    if (this.target) {
        // Target is alive — use live position
        targetX = this.target.x;
        targetY = this.target.y;
        this.lastTargetX = targetX;
        this.lastTargetY = targetY;
    } else if (this.lastTargetX !== undefined && this.lastTargetY !== undefined) {
        // No target — use saved last position
        targetX = this.lastTargetX;
        targetY = this.lastTargetY;
    } else {
        // No target, no last position — collapse line
        targetX = this.player.x;
        targetY = this.player.y;
    }

    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    this.setPosition(this.player.x, this.player.y);
    this.setRotation(angle);
    this.displayWidth = length;
}


}
