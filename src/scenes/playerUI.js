import NetworkManager from "../things/NetworkManager.js";

export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super('PlayerUI');
        this.player = null;
        this.gameScene = null;
    }
    init(data) {
        this.player = data.player;
        this.gameScene = data.gameScene;
        this.player.playerUI = this;
    }

    create() {
        this.visible = true;
        this.Chatting = false;
        this.playerList = [];
        this.network = NetworkManager.instance;
        this.playerTextMap = {}; // Object to hold playerId => textObject

        this.setWeaponIcon(this.player.leftWeapon.name, 0);
        this.setWeaponIcon(this.player.rightWeapon.name, 1);

        this.leftWeaponBox = this.add.graphics().setDepth(1);
        this.rightWeaponBox = this.add.graphics().setDepth(1);

        this.textBoxX = this.scale.width / 2
        this.textBoxY = this.scale.height / 2 + 100;

        this.scale.on('resize', this.resizeUI, this);

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.Chatting) {
                const input = this.textBox?.node?.querySelector('#textchat');
                if (input) {
                    this.closeTextChat(input.value);
                }
                return;
            }

            if (this.inputFocused) {
                // You're typing in a different input (e.g. name field), do nothing
                return;
            }

            // Open chat if none of the above is true
            this.openTextChat();
        });


        this.input.keyboard.on('keydown-ESC', () => {
            if (this.Chatting) {
                this.closeTextChat('');
            }
        });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.updatePlayerList()
        });
    }

    update() {
        super.update();
        this.cooldownRed(true);
        this.cooldownRed(false);


    }

    resizeUI(gamesize) {
        const { width, height } = gamesize;
        if (!this.leftWeaponBox || !this.leftWeaponIcon || !this.rightWeaponBox || !this.rightWeaponIcon) return;
        this.leftWeaponBox.y = height;
        this.leftWeaponIcon.y = height;
        this.rightWeaponBox.x = width;
        this.rightWeaponBox.y = height;
        this.rightWeaponIcon.x = width;
        this.rightWeaponIcon.y = height;
        this.textBoxX = width / 2;
        this.textBoxY = height / 2 + 100;
    }

    setWeaponIcon(name = 'shurikan', slot = 0) {
        const icon = name + 'icon'
        if (slot === 0) {
            if (!this.leftWeaponIcon) {
                this.leftWeaponIcon = this.add.image(0, this.scale.height, icon).setOrigin(0, 1).setScale(.5);
            } else {
                this.leftWeaponIcon.setTexture(icon)
            }
        } else {
            if (!this.rightWeaponIcon) {
                this.rightWeaponIcon = this.add.image(this.scale.width, this.scale.height, icon).setOrigin(1, 1).setScale(.5);
            } else {
                this.rightWeaponIcon.setTexture(icon)
            }
        }
    }

    cooldownRed(left) {
        const weaponBox = left ? this.leftWeaponBox : this.rightWeaponBox;
        const weaponIcon = left ? this.leftWeaponIcon : this.rightWeaponIcon;
        const cdProgress = left ? this.player.leftWeapon.cdProgress : this.player.rightWeapon.cdProgress;

        if (!weaponIcon) return;
        if (cdProgress > .95) {
            weaponBox.clear();
            return;
        }
        weaponBox.clear();

        if (cdProgress > 0) {
            const fillHeight = cdProgress * weaponIcon.displayHeight;

            // fillX is based on the weapon icon origin
            const fillX = left
                ? weaponIcon.x
                : weaponIcon.x - weaponIcon.displayWidth;

            const fillY = weaponIcon.y - fillHeight;

            weaponBox.fillStyle(0xff0000, 0.5);
            weaponBox.fillRect(fillX, fillY, weaponIcon.displayWidth, fillHeight);
        }
    }

    openTextChat() {
        if (this.Chatting) return;

        this.Chatting = true;

        if (!this.cache.html.exists('textchat')) {
            this.textBox = this.add.dom(this.textBoxX, this.textBoxY).createFromHTML(`
            <input type="text" id="textchat" name="textchat" placeholder="Chat.." 
                   style="font-size: 20px; width: 300px; padding: 5px;" />
        `);
        } else {
            this.textBox = this.add.dom(this.textBoxX, this.textBoxY).createFromCache('textchat');
        }

        const input = this.textBox.node?.querySelector('#textchat');
        if (!input) {
            console.error('Input element not found!');
            this.Chatting = false;
            return;
        }

        input.focus();
        this.inputFocused = true;
    }


    closeTextChat(message) {
        console.log('Player typed:', message);

        this.player.makeChatBubble(message);


        this.Chatting = false;

        if (this.textBox) {
            this.textBox.destroy();
            this.textBox = null;
            this.inputFocused = false;
        }
    }

    updatePlayerList() {
        if (!this.network.savedOtherPlayers) return;

        const activeIds = new Set();

        this.network.savedOtherPlayers.forEach((player, index) => {
            const yloc = index * 50 + 200;
            const playerId = player.id || player.source; // use a stable unique ID
            activeIds.add(playerId);

            if (this.playerTextMap[playerId]) {
                // Update existing text
                const textObj = this.playerTextMap[playerId];
                textObj.setText(player.nameText + ' - ' + player.source);
                textObj.setY(yloc);
                textObj.setColor(player.nameColor);
            } else {
                // Create new text and store it
                const textObj = this.add.text(0, yloc, player.nameText + ' - ' + player.source, {
                    fontSize: '24px',
                    fill: '#FFFFFF',
                });
                this.playerTextMap[playerId] = textObj;
            }
        });

        // Clean up texts for players no longer in the list
        for (const id in this.playerTextMap) {
            if (!activeIds.has(id)) {
                this.playerTextMap[id].destroy();
                delete this.playerTextMap[id];
            }
        }
    }
}

