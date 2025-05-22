import GameManager from "./GameManager.js";

export default class EscMenu extends Phaser.Scene
{
    constructor()
    {
        super('EscMenu');
    }
    
    init(data)
    {
        this.gameScene = data.gameScene;
    }

    create()
    {
        window.addEventListener('beforeunload', () => GameManager.save());
        // Add slider track
        const track = this.add.rectangle(400, 400, 200, 10, 0xffffff).setOrigin(0.5).setVisible(false);

        // Add draggable handle
        const handle = this.add.circle(400, 400, 10, 0xff0000).setInteractive().setVisible(false);

        this.input.setDraggable(handle);

        // Store references
        this.slider = { track, handle };
        this.visible = false;

        this.bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5).setVisible(false);
        this.text = this.add.text(400, 300, 'Menu', {
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.input.keyboard.on('keydown-ESC', () => {
            this.visible = !this.visible;
            this.bg.setVisible(this.visible);
            this.text.setVisible(this.visible);
            this.slider.track.setVisible(this.visible);
            this.slider.handle.setVisible(this.visible);

            if (this.visible) {
                this.scene.pause(this.gameScene);
            } else {
                this.scene.resume(this.gameScene);
        }
        });

        // Drag logic
        this.input.on('drag', (pointer, gameObject, dragX) => {
        const minX = track.x - track.width / 2;
        const maxX = track.x + track.width / 2;

        // Clamp drag
        dragX = Phaser.Math.Clamp(dragX, minX, maxX);
        gameObject.x = dragX;

        // Set global volume
        const percent = (dragX - minX) / (maxX - minX);
        this.sound.volume = percent;
        GameManager.volume = this.sound.volume;
        GameManager.save();
        });

        // Set initial volume based on handle position
        const setInitialVolume = (volume) => {
            const minX = track.x - track.width / 2;
            const maxX = track.x + track.width / 2;
            handle.x = Phaser.Math.Linear(minX, maxX, volume);

            this.sound.volume = volume;
        };

        setInitialVolume(GameManager.volume);
    }
    
}