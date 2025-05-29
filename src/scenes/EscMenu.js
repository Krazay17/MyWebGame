import GameManager from "../things/GameManager.js";

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
            
            // Save Volume
            GameManager.volume = this.sound.volume;
            GameManager.save();
        });

        const setInitialVolume = (volume) => {
            const minX = track.x - track.width / 2;
            const maxX = track.x + track.width / 2;
            handle.x = Phaser.Math.Linear(minX, maxX, volume);

            this.sound.volume = volume;
        };

        setInitialVolume(GameManager.volume);

        //         // Show the name input box when the scene starts
        // this.createNameInput((playerName) => {
        //     console.log('Player name is:', playerName);

        //     // You can store it wherever you like
        //     this.gameManager.playerName = playerName;

        //     // Move to next scene or start game, etc.
        //     this.scene.start('GameScene');
        // });
    }

    // createNameInput(onSubmitCallback) {
    //     const input = document.createElement('input');
    //     input.type = 'text';
    //     input.placeholder = 'Enter your name';
    //     input.style.position = 'absolute';
    //     input.style.top = '50%';
    //     input.style.left = '50%';
    //     input.style.transform = 'translate(-50%, -50%)';
    //     input.style.fontSize = '24px';
    //     input.style.padding = '8px';
    //     input.maxLength = 20;

    //     document.body.appendChild(input);
    //     input.focus();

    //     input.addEventListener('keydown', (event) => {
    //         if (event.key === 'Enter') {
    //             const name = input.value.trim();
    //             if (name) {
    //                 onSubmitCallback(name);
    //                 document.body.removeChild(input);
    //             }
    //         }
    //     });

    //     // Optional: Remove the input when the scene shuts down
    //     this.events.once('shutdown', () => {
    //         if (document.body.contains(input)) {
    //             document.body.removeChild(input);
    //         }
    //     });
    // }
}