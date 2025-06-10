import GameManager from "../things/GameManager.js";
import NetworkManager from "../things/NetworkManager.js";

export default class EscMenu extends Phaser.Scene {
    constructor() {
        super('EscMenu');
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.playerUI = data.playerUI;
        this.nameInput = null;
        this.colorInput = null;
    }

    create() {
        this.uiElements = [];

        this.network = NetworkManager.instance;

        window.addEventListener('beforeunload', () => GameManager.save());

        // Background
        this.bg = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8).setOrigin(0, 0);

        this.resetButton = this.add.rectangle(0, 0, 225, 75, 0xFFFFFF, 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop(this.gameScene);
                this.scene.start('Home');
            });
        const resetText = this.add.text(0, 0, 'RESET', {
            font: '32px',
            fill: '#FF0000',
        })

        // Slider track and handle
        const track = this.add.rectangle(400, 400, 200, 10, 0xffffff).setOrigin(0.5);
        const handle = this.add.circle(400, 400, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle);
        this.slider = { track, handle };

                // Slider track and handle
        const track1 = this.add.rectangle(400, 450, 200, 10, 0xffffff).setOrigin(0.5);
        const handle1 = this.add.circle(400, 450, 10, 0xff0000).setInteractive();
        this.input.setDraggable(handle1);
        handle1.name = 'music';
        this.slider1 = { track1, handle1 };


        const instructions = this.add.text(0, 50,
            'ASD - Move\nW - Heal\nSPACE - Jump\nShift - dash\nL/R Click - Attack\nC -Inventory\nT - Home', {
            fontSize: '32px',
            color: '#4fffff',
        });
        instructions.setScrollFactor(0);

        // Name display
        this.nameDisplay = this.add.text(400, 250, GameManager.name.text || 'Hunter', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: GameManager.name.color || '#FFFFFF',
        }).setOrigin(0.5);

        // Store all UI elements for visibility toggling
        this.uiElements.push(this.bg, this.nameDisplay, track, handle, track1, handle1, instructions, this.resetButton, resetText);

        // Hide initially
        this.setUIVisible(false);

        // ESC key
        this.input.keyboard.on('keydown-ESC', () => {
            this.visible = !this.visible;
            this.setUIVisible(this.visible);

            if (this.visible) {
                this.scene.pause(this.gameScene);
                this.openNameInput();
                this.openColorInput();
            } else {
                this.scene.resume(this.gameScene);
                this.destroyNameInput();
                this.destroyColorInput();
            }
        });

        // Slider drag logic
        this.input.on('drag', (pointer, gameObject, dragX) => {
            const minX = track.x - track.width / 2;
            const maxX = track.x + track.width / 2;

            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            gameObject.x = dragX;

            const percent = (dragX - minX) / (maxX - minX);

            if (gameObject.name === 'music') {
                globalThis.currentMusic.volume = percent;
                GameManager.volume.music = percent
                GameManager.save();
            } else {
            this.sound.volume = percent;

            GameManager.volume.master = percent;
            GameManager.save();
            }
        });

        this.setInitialVolume(GameManager.volume);
    }

    setUIVisible(visible) {
        this.uiElements.forEach(obj => obj.setVisible(visible));
        if (this.nameInput) this.nameInput.setVisible(visible);
        if (this.colorInput) this.colorInput.setVisible(visible);
    }

    setInitialVolume(volume) {
        const minX = this.slider.track.x - this.slider.track.width / 2;
        const maxX = this.slider.track.x + this.slider.track.width / 2;
        this.slider.handle.x = Phaser.Math.Linear(minX, maxX, volume.master);
        this.sound.volume = volume.master ?? 1;

        if (!globalThis.currentMusic) return;
        const minX1 = this.slider1.track1.x - this.slider1.track1.width / 2;
        const maxX1 = this.slider1.track1.x + this.slider1.track1.width / 2;
        this.slider1.handle1.x = Phaser.Math.Linear(minX1, maxX1, volume.music);
        globalThis.currentMusic.volume = volume.music ?? 1;
    }

    openNameInput() {
        this.nameInput = this.add.dom(400, 300).createFromHTML(`
            <input type="text" id="nameInput" name="name" placeholder="Enter name"
                   style="font-size: 20px; width: 200px; padding: 5px;" />
        `).setOrigin(0.5);


        const domElement = this.nameInput.getChildByName('name');
        domElement.value = GameManager.name.text || 'Hunter';

        domElement.addEventListener('focus', () => {
            this.playerUI.inputFocused = true;
    });

        domElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.stopImmediatePropagation();
                const name = domElement.value.trim();
                GameManager.name.text = name;
                this.nameDisplay.setText(name);
                GameManager.save();

                this.network.socket.emit('playerName', { text: GameManager.name.text, color: GameManager.name.color });

                domElement.blur();
                this.playerUI.inputFocused = false;
            }
        });
    }

    destroyNameInput() {
        if (this.nameInput) {
            this.nameInput.destroy();
            this.nameInput = null;
            this.playerUI.inputFocused = false;
        }
    }

    openColorInput() {
        this.colorInput = this.add.dom(400, 350).createFromHTML(`
            <input type="color" id="nameColor" value="${GameManager.name.color || '#ffffff'}"
                   style="width: 80px; height: 40px; border: none;" />
        `).setOrigin(0.5);

        const colorPicker = this.colorInput.getChildByID('nameColor');
        colorPicker.addEventListener('input', (event) => {
            const color = event.target.value;
            GameManager.name.color = color;
            this.nameDisplay.setColor(color);
            GameManager.save();

            this.network.socket.emit('playerName', { text: GameManager.name.text, color: GameManager.name.color });
        });
    }

    destroyColorInput() {
        if (this.colorInput) {
            this.colorInput.destroy();
            this.colorInput = null;
        }
    }
}
