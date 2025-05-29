export default class Inventory extends Phaser.Scene {
    constructor() {
        super('Inventory');
        this.player = null;
    }
    init(data) {
        this.player = data.player;
        this.player.inventory = this
        this.aura = this.player.aura;
    }

    create() {
        this.visible = false;
        this.buttons = [];

        this.bg = this.add.rectangle(1200, 300, 800, 600, 0x000000, 0.5).setVisible(false);
        this.text = this.add.text(1200, 25, 'Inventory', {
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.buttons.push(this.setupButton(1000, 200, false, 'shurikan', 'shurikan', .4));
        this.buttons.push(this.setupButton(1200, 200, false, 'sword', 'swordicon', .5));
        this.buttons.push(this.setupButton(1400, 200, false, 'darkorb', 'darkorb', 1, 0));
        this.buttons.push(this.setupButton(1000, 400, false, 'whip', 'whipicon', .5));

        this.buttons.push(this.setupButton(1200, 550, true, 'zap', 'auraicon', 1, 0));

        this.auraText = this.add.text(1200, 500, 'Aura level: ' + this.aura.level, {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5).setVisible(false);

        this.auraCostText = this.add.text(1200, 600, 'Cost: ' + this.aura.getCost(), {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5).setVisible(false);

        this.input.keyboard.on('keydown-C', () => {
            this.visible = true;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
            this.auraText.setVisible(this.visible);
            this.auraCostText.setVisible(this.visible);
        });

        this.input.keyboard.on('keyup-C', () => {
            this.visible = false;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
            this.auraText.setVisible(this.visible);
            this.auraCostText.setVisible(this.visible);
        });
        this.input.keyboard.on('keydown-X', () => {
            this.visible = !this.visible;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.buttons.forEach(button => button.setVisible(this.visible));
            this.auraText.setVisible(this.visible);
            this.auraCostText.setVisible(this.visible);
        });

    }

    setupButton(x = 1200, y = 200, isAura = false, weapon = 'darkorb', icon = 'darkorb', scale = 1) {
        const button = this.add.image(x, y, icon)
            .setScale(scale)
            .setInteractive()
            .setVisible(false)
            .on('pointerover', () => button.setTint(0x7d7d7d))
            .on('pointerout', () => button.setTint())
            .on('pointerdown', (pointer) => {
                this.clickedButton(pointer, button)
            });

        button.weapon = weapon;
        button.isAura = isAura;
        return button;
    }

    clickedButton(pointer, button) {
        if (!button.isAura) {
            const slot = pointer.button === 0
                ? 0
                : 1;
            this.player.equipWeapon(button.weapon, slot)
        } else {
            if (this.player.tryIncreaseAura()) {
                this.auraText.setText('Aura level: ' + this.aura.level);
                this.auraCostText.setText('Cost: ' + this.aura.getCost());
            }
        }
    }
}