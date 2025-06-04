export default class ChatBubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, message, style = {}) {
        super(scene, x, y);

        scene.add.existing(this);
        this.setDepth(9);

        this.padding = 10;

        // this.bg = scene.add.graphics();
        // this.add(this.bg);

        this.text = scene.make.text({
            x: 0,
            y: 0,
            text: '',
            style: {
                fontSize: '14px',
                fill: '#FFFFFF',
                wordWrap: { width: 200, useAdvancedWrap: true }
            },
            add: false
        });
        this.text.setOrigin(.5, 1)
        this.add(this.text);

        this.message = [];
        this.updateMessage(message);

        //this.updateBubble();
        this.fadeOutTimers()

    }

    updateMessage(message) {
        if (!this.scene || !this.text) return;

        clearTimeout(this.oldChatTimer);
        const removeOldChat = () => {
            if(!this.message.shift()) return;
        this.oldChatTimer = setTimeout(() => removeOldChat(), 5000);
        }
        this.oldChatTimer = setTimeout(() => removeOldChat(), 5000);

        this.fadeOutTimers()
        this.message.push(message)
        this.text.setText(this.message);

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
        if (!this.scene) return;

        this.setAlpha(1);
        this.scene.time.removeEvent(this.fadeOutTimer);
        this.scene.time.removeEvent(this.fadeOutLoop);
        this.fadeOutTimer = this.scene.time.delayedCall(15000, this.fadeOut, null, this)

    }
    fadeOut() {
        if (!this.scene) return;

        this.fadeOutLoop = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.scene) return;

                if (this.alpha > 0) {
                    this.setAlpha(this.alpha - .05);
                } else {
                    clearTimeout(this.oldChatTimer);
                    this.message = [];
                    this.scene.time.removeEvent(this.fadeOutLoop);
                }
            }
        })
    }

}