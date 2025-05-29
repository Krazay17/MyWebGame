export default class AuraSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'aura', 0);
        scene.add.existing(this);

        if (!scene.anims.get('weakaura')) {
            scene.anims.create({
                key: 'weakaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 0, end: 1 }),
                frameRate: 6,
                repeat: -1,
                yoyo: true,
            });
        }

        if (!scene.anims.get('midaura')) {
            scene.anims.create({
                key: 'midaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 0, end: 2 }),
                frameRate: 4,
                repeat: -1,
            });
        }
        if (!scene.anims.get('strongaura')) {
            scene.anims.create({
                key: 'strongaura',
                frames: this.anims.generateFrameNumbers('aura', { start: 2, end: 3 }),
                frameRate: 6,
                repeat: -1,
                yoyo: true,
            });
        }

        this.play('weakaura');
    }

    setAuraLevel(level) {
        switch (level) {
            case level < 5:
                this.play('weakaura');
                break;
            case level < 10:
                this.play('midaura');
                break;
            default:
                this.play('strongaura');
        }
    }
}