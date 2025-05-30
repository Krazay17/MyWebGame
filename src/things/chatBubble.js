export default class ChatBubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, message, style = {}) {
        super(scene, x, y);

        scene.add.existing(this);

        this.padding = 10;

        // this.bg = scene.add.graphics();
        // this.add(this.bg);

        this.text = scene.add.text(0, 0, message, {
            fontSize: '14px',
            fill: '#FFFFFF',
            wordWrap: { width: 50, useAdvancedWrap: true }
        });
        this.text.setOrigin(.5, 1)
        this.add(this.text);

        //this.updateBubble();
        this.fadeOutTimers()

    }

    updateMessage(message) {
        this.fadeOutTimers()
        this.text.setText(message);
        //this.updateBubble();
    }

    updateBubble() {
        const bounds = this.text.getBounds();
        this.bg.clear();
        this.bg.fillStyle(0xffffff, 1);
        this.bg.fillRoundedRect(
            bounds.x - this.padding,
            bounds.y - this.padding,
            bounds.width + this.padding * 2,
            bounds.height + this.padding * 2,
            10
        );

        this.text.setX(-bounds.width / 2);
        this.text.setY(-bounds.height / 2);
    }

    fadeOutTimers() {
        this.setAlpha(1);
        this.scene.time.removeEvent(this.fadeOutTimer);
        this.scene.time.removeEvent(this.fadeOutLoop);
        this.fadeOutTimer = this.scene.time.delayedCall(4000, this.fadeOut, null, this)

    }
    fadeOut() {
        this.fadeOutLoop = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.alpha > 0) {
                    this.setAlpha(this.alpha - .05);
                } else {
                    this.scene.time.removeEvent(this.fadeOutLoop);
                }
            }
        })
    }

}