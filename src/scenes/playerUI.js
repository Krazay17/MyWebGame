export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super('PlayerUI');
        this.player = null;
        this.gameScene = null;
    }
    init(data) {
        this.player = data.player;
        this.player.playerUI = this;
    }

    create() {
        this.visible = true;


        this.setWeaponIcon(this.player.leftWeapon.name, true);
        this.setWeaponIcon(this.player.rightWeapon.name, false);
        

        this.leftWeaponBox = this.add.graphics(0, this.scale.height, 100, 100, 0x6b6b6b, 1)

        this.rightWeaponBox = this.add.graphics()

        this.scale.on('resize', this.resizeUI, this);
    }

    update() {
        super.update();
        this.rightWeaponBox.fillRect(this.scale.width - 100, this.scale.height -100, 100, this.player.rightWeapon.cdProgress * 100);
    }

    resizeUI(gamesize) {
        const { width, height } = gamesize;
        this.leftWeaponBox.y = height;
        this.leftWeaponIcon.y = height;
        this.rightWeaponBox.x = width;
        this.rightWeaponBox.y = height;
        this.rightWeaponIcon.x = width;
        this.rightWeaponIcon.y = height;
        console.log('resizing')
    }

    setWeaponIcon(name = 'shurikan', left = true) {
        const icon = name + 'icon'
        if (left) {
            if(!this.leftWeaponIcon){
            this.leftWeaponIcon = this.add.image(0, this.scale.height, icon, 1).setOrigin(0, 1).setScale(.5);
            } else {
                this.leftWeaponIcon.setTexture(icon)
            }
        } else {
            if (!this.rightWeaponIcon) {
            this.rightWeaponIcon = this.add.image(this.scale.width, this.scale.height, icon, 1).setOrigin(1, 1).setScale(.5);
            } else {
                this.rightWeaponIcon.setTexture(icon)
            }
        }
    }
}