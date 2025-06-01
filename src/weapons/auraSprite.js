export default class AuraSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, level = 1) {
        super(scene, x, y, 'aura', 0);
        scene.add.existing(this);
        this.setAlpha(.2);

        if (!scene.anims.get('weakaura')) {
            scene.anims.create({
                key: 'weakaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        if (!scene.anims.get('midaura')) {
            scene.anims.create({
                key: 'midaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1,
            });
        }
        if (!scene.anims.get('strongaura')) {
            scene.anims.create({
                key: 'strongaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 3, end: 5 }),
                frameRate: 4,
                repeat: -1,
                yoyo: true,
            });
        }

        this.setAuraLevel(level);
    }

    setAuraLevel(level) {
            this.setScale(level * .1);
        if (level < 5) {
            this.play('weakaura');
        } else if (level < 10) {
            this.play('midaura');
        } else {
            this.play('strongaura');
    }

}
}