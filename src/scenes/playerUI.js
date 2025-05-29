export default class PlayerUI extends Phaser.Scene {
    constructor() {
        super('PlayerUI');
        this.player = null;
        this.gameScene = null;
    }
    init(data) {
        this.player = data.player;
        this.player.playerUI = this;
        this.setWeaponIcon(this.player.leftWeapon.name, true);
        this.setWeaponIcon(this.player.rightWeapon.name, false);
    }

    create() {
        this.visible = true;


        this.leftWeaponBox = this.add.graphics().setDepth(1);
        this.rightWeaponBox = this.add.graphics().setDepth(1);

        this.scale.on('resize', this.resizeUI, this);
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
    }

    setWeaponIcon(name = 'shurikan', slot = 0) {
        const icon = name + 'icon'
        console.log(icon)
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

}