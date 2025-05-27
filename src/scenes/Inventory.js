export default class Inventory extends Phaser.Scene {
    constructor() {
        super('Inventory');
        this.player = null;
    }
    init(data) {
        this.player = data.player;
        this.player.inventory = this
    }

    create() {
        this.visible = false;
        this.buttons = [];

        this.bg = this.add.rectangle(1200, 300, 800, 600, 0x000000, 0.5).setVisible(false);
        this.text = this.add.text(1200, 25, 'Inventory', {
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.buttons.push(this.setupButton(1000, 200, 'shurikan', 'shurikan', .4));
        this.buttons.push(this.setupButton(1200, 200, 'sword', 'swordicon', .5));
        this.buttons.push(this.setupButton(1400, 200, 'darkorb', 'darkorb', 1, 0));
        this.buttons.push(this.setupButton(1000, 400, 'whip', 'whipicon', .5));

        this.input.keyboard.on('keydown-C', () => {
            this.visible = true;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
        });

        this.input.keyboard.on('keyup-C', () => {
            this.visible = false;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
        });
        this.input.keyboard.on('keydown-X', () => {
            this.visible = !this.visible;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
        });

    }

    setupButton(x = 1200, y = 200, weapon = 'darkorb', icon = 'darkorb', scale = 1, frame = 2) {
        const button = this.add.image(x, y, icon, frame)
            .setScale(scale)
            .setInteractive()
            .setVisible(false)
            .on('pointerover', () => button.setTint(0x7d7d7d))
            .on('pointerout', () => button.setTint())
            .on('pointerdown', (pointer) => {
                const left = pointer.button === 0;
                this.player.equipWeapon(weapon, left)
            });
        return button;
    }
}