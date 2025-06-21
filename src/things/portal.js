import Pickup from "./Pickup";

export default class Portal extends Pickup {
    constructor(scene, x, y, otherPortal) {
        super(scene, x, y, 'portalsheet')

        scene.add.existing(this);
        this.setScale(.3);

        this.otherPortal = otherPortal;


        if (!scene.anims.get('portalsheet')) {
            scene.anims.create({
                key: 'portalsheet',
                frameRate: 3,
                frames: [
                    { key: 'portalsheet', frame: 0 },
                    { key: 'portalsheet', frame: 1 },
                ],
                repeat: -1,
            });
        }
        this.play('portalsheet');


    }

    hit() { };

    playerCollide(player) {
        const now = Date.now();
        const otherPortal = this.scene.portalList[this.otherPortal];
        if (!otherPortal || (now - this.justPortaled < 0)) return;

        const portalX = otherPortal?.x;
        const portalY = otherPortal?.y;
        const portalAngle = otherPortal.rotation;
        const prevVelocity = player.body.velocity.length();
        const newVelocity = new Phaser.Math.Vector2(Math.sin(portalAngle), Math.cos(portalAngle)).scale(prevVelocity);
        newVelocity.y = newVelocity.y * -1;

        otherPortal.justPortaled = now + 1000;
        player.setPosition(portalX, portalY);
        player.setVelocity(newVelocity.x, newVelocity.y);
    }
}