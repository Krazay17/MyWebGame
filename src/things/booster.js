import { getProperty, changeCollision } from "../myFunctions";
import Pickup from "./Pickup";

export default class Booster extends Pickup {
    constructor(scene, x, y, obj) {
        super(scene, x + obj.width / 2, y + obj.height / 2, 'booster');
        this.props = getProperty(obj);

        this.setScale(.3);
        changeCollision(this, obj.width * 4, obj.height * 4);

        const rot = Phaser.Math.DegToRad(obj.rotation);
        this.setRotation(rot);
        this.boost = new Phaser.Math.Vector2(Math.sin(rot), Math.cos(rot)).scale(this.props?.power ?? 1000);
        this.boost.y = this.boost.y * -1;


        if (!scene.anims.get('booster')) {
            scene.anims.create({
                key: 'booster',
                frames: scene.anims.generateFrameNumbers('booster', { start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1,
            })
        }
        this.play('booster');
    }

    playerCollide(player) {
        const playerVel = player.body.velocity;

        if(this.boostTween) {
            this.scene.tweens.remove(this.boostTween);
            delete this.boostTween;
        }
        this.boostTween = this.scene.add.tween({
            targets: playerVel,
            x: this.boost.x,
            y: this.boost.y,
            ease: 'power4',
            duration: this.props?.duration ?? 200,
        })
    }


    hit() { }
}