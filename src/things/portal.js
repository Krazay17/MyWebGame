import { changeCollision, getProperty } from "../myFunctions";
import Pickup from "./Pickup";

export default class Portal extends Pickup {
    constructor(scene, x, y, obj) {
        super(scene, x, y, 'portalsheet')

        scene.add.existing(this);
        
        const objProps = getProperty(obj);
        if (!this.scene.portalList) {
            this.scene.portalList = {};
        }
        this.scene.portalList[objProps.index] = this;
        this.setScale(.3);
        changeCollision(this, obj.width*4, obj.height*4)
        const rot = Phaser.Math.DegToRad(obj.rotation);
        this.setRotation(rot);
        
        this.setTint(objProps.color);

        this.otherPortal = objProps?.otherPortal;


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

    const portalX = otherPortal.x;
    const portalY = otherPortal.y;

    // Shift angle so 0 = up
    const portalAngle = otherPortal.rotation - Math.PI / 2;

    // Get player speed (magnitude only)
    const speed = player.body.velocity.length();

    // Build direction vector from adjusted portal rotation
    const dir = new Phaser.Math.Vector2(
        Math.cos(portalAngle),
        Math.sin(portalAngle)
    );

    // Scale by player speed
    const newVelocity = dir.scale(speed);

    // Cooldown
    otherPortal.justPortaled = now + 1000;

    // Teleport player and apply velocity
    this.scene.cameras.main.startFollow(player, false, 1, 1);
    player.setPosition(portalX, portalY);
    this.scene.cameras.main.startFollow(player, false, .04, .04);
    player.setVelocity(newVelocity.x, newVelocity.y);
}




}