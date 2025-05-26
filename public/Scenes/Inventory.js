export default class Inventory extends Phaser.Scene
{
    constructor()
    {
        super('Inventory');
        this.player = null;
    }
    init(data)
    {
        this.player = data.player;
    }

    create()
    {
        this.visible = false;

        this.bg = this.add.rectangle(1200, 300, 800, 600, 0x000000, 0.5).setVisible(false);
        this.text = this.add.text(1200, 25, 'Inventory', {
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.button1 = this.add.rectangle(1200, 200, 100, 80, 0x0000FF, 1)
        .setInteractive()
        .setVisible(false)
        .on('pointerover', () => this.button1.setFillStyle(0x0000AA))
        .on('pointerout', () => this.button1.setFillStyle(0x0000FF));

        this.input.keyboard.on('keydown-C', () => {
            this.visible = true;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.button1.setVisible(this.visible);
        });

        this.input.keyboard.on('keyup-C', () => {
            this.visible = false;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.button1.setVisible(this.visible);
        });
        this.input.keyboard.on('keydown-X', () => {
            this.visible = !this.visible;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.button1.setVisible(this.visible);
        });
    }
    
}