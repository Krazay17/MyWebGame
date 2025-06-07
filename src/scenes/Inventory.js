import GameManager from "../things/GameManager";
import { weaponUpgradeCosts } from '../weapons/WeaponManager'

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
        this.input.enabled = false;
        this.scene.setVisible(false);
        this.scene.setActive(false);
        this.upgradeButtons = [];
        this.allButtons = [];

        this.bg = this.add.rectangle(1200, 300, 800, 800, 0x000000, 0.5);

        this.shurikanButton = this.setupWeaponButton(900, 100, 'shurikan', 'shurikan', .4);
        this.swordButton = this.setupWeaponButton(1100, 100, 'sword', 'swordicon', .5);
        this.darkorbButton = this.setupWeaponButton(1300, 100, 'darkorb', 'darkorb', 1, 0);
        this.whipButton = this.setupWeaponButton(1500, 100, 'whip', 'whipicon', .5);

        this.auraButton = this.setupButton(1200, 500, 'auraicon', 1)
            .on('pointerdown', () => {
                if (this.player.aura.tryIncreaseAura()) {
                    this.auraText.setText('Aura level: ' + GameManager.power.auraLevel);
                    this.auraCostText.setText('Cost: ' + this.player.aura.getCost());
                }
            });
        this.auraText = this.add.text(1200, 425, 'Aura level: ' + GameManager.power.auraLevel, {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.auraCostText = this.add.text(1200, 450, 'Cost: ' + this.aura.getCost(), {
            fontSize: '24px',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.shurikanUpgradeAButton = this.setupButton(900, 200, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + weaponUpgradeCosts.shurikanA + '\nShurikan hits 3 more targets')
            .on('pointerdown', () => {
                if (!GameManager.power.shurikanUpgradeA && (GameManager.power.money > weaponUpgradeCosts.shurikanA)) {
                    this.player.updateMoney(-weaponUpgradeCosts.shurikanA);
                    GameManager.power.shurikanUpgradeA = true;
                    GameManager.power.spent += weaponUpgradeCosts.shurikanA;
                    this.player.leftWeapon.setupStats();
                    this.player.rightWeapon.setupStats();
                    this.shurikanUpgradeAButton.disableInteractive();
                    this.shurikanUpgradeAButton.setTint(0xFFFFFF);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });
        this.shurikanUpgradeBButton = this.setupButton(900, 300, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + weaponUpgradeCosts.shurikanB + '\nShurikan deals 1 more damage to first target')
            .on('pointerdown', () => {
                if (!GameManager.power.shurikanUpgradeB && (GameManager.power.money > weaponUpgradeCosts.shurikanB)) {
                    this.player.updateMoney(-weaponUpgradeCosts.shurikanB);
                    GameManager.power.shurikanUpgradeB = true;
                    GameManager.power.spent += weaponUpgradeCosts.shurikanB;
                    this.player.leftWeapon.setupStats();
                    this.player.rightWeapon.setupStats();
                    this.shurikanUpgradeBButton.disableInteractive();
                    this.shurikanUpgradeBButton.setTint(0xFFFFFF);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });
        this.shurikanUpgradeCButton = this.setupButton(900, 400, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + weaponUpgradeCosts.shurikanC + '\nShurikan splits into 3 on frist hit')
            .on('pointerdown', () => {
                if (!GameManager.power.shurikanUpgradeC && (GameManager.power.money > weaponUpgradeCosts.shurikanC)) {
                    this.player.updateMoney(-weaponUpgradeCosts.shurikanC);
                    GameManager.power.shurikanUpgradeC = true;
                    GameManager.power.spent += weaponUpgradeCosts.shurikanC;
                    this.player.leftWeapon.setupStats();
                    this.player.rightWeapon.setupStats();
                    this.shurikanUpgradeCButton.disableInteractive();
                    this.shurikanUpgradeCButton.setTint(0xFFFFFF);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });

        this.auraUpgradeA0Button = this.setupButton(1100, 600, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + this.player.aura.upgradeCosts.A1 + '\nZap hits 2 targets')
            .on('pointerdown', () => {
                if (this.player.aura.upgradeA(1)) {
                    this.auraUpgradeA0Button.disableInteractive();
                    this.auraUpgradeA0Button.setTint(0xFFFFFF);
                    this.auraUpgradeA1Button.disableInteractive();
                    this.auraUpgradeA1Button.setTint(0x000000);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });

        this.auraUpgradeA1Button = this.setupButton(1300, 600, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + this.player.aura.upgradeCosts.A2 + '\nZap damage +2')
            .on('pointerdown', () => {
                if (this.player.aura.upgradeA(2)) {
                    this.auraUpgradeA1Button.disableInteractive();
                    this.auraUpgradeA1Button.setTint(0xFFFFFF);
                    this.auraUpgradeA0Button.disableInteractive();
                    this.auraUpgradeA0Button.setTint(0x000000);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });

        this.auraUpgradeB0Button = this.setupButton(1100, 700, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + this.player.aura.upgradeCosts.B1 + '\nZap spawns orbs on hit')
            .on('pointerdown', () => {
                if (this.player.aura.upgradeB(1)) {
                    this.auraUpgradeB0Button.disableInteractive();
                    this.auraUpgradeB0Button.setTint(0xFFFFFF);
                    this.auraUpgradeB1Button.disableInteractive();
                    this.auraUpgradeB1Button.setTint(0x000000);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });

        this.auraUpgradeB1Button = this.setupButton(1300, 700, 'auraicondesat', 1, '0x00FFEE', 'Cost: ' + this.player.aura.upgradeCosts.B2 + '\nZap damage +2')
            .on('pointerdown', () => {
                if (this.player.aura.upgradeB(2)) {
                    this.auraUpgradeB1Button.disableInteractive();
                    this.auraUpgradeB1Button.setTint(0xFFFFFF);
                    this.auraUpgradeB0Button.disableInteractive();
                    this.auraUpgradeB0Button.setTint(0x000000);
                    this.tooltipText.setText('');
                    this.tooltipText.setAlpha(0);
                }
            });

        this.resetPowerButton = this.setupButton(1200, 800, 'auraicondesat', 1, '0xFF0000', 'Reset all power')
            .on('pointerdown', () => {

                this.player.updateMoney(GameManager.power.spent / 2)
                GameManager.power.spent = 0;

                this.upgradeButtons.forEach(b => {
                    this.resetButtons(b);
                });

                this.player.aura.resetUpgrades();
                GameManager.power.shurikanUpgradeA = null;
                GameManager.power.shurikanUpgradeB = null;
                GameManager.power.shurikanUpgradeC = null;
                this.player.leftWeapon.setupStats();
                this.player.rightWeapon.setupStats();
                this.auraText.setText('Aura level: ' + GameManager.power.auraLevel);
                this.auraCostText.setText('Cost: ' + this.player.aura.getCost());

                GameManager.save()

            });

        this.upgradeButtons.push(
            this.auraUpgradeA0Button,
            this.auraUpgradeA1Button,
            this.auraUpgradeB0Button,
            this.auraUpgradeB1Button,
            this.shurikanUpgradeAButton,
            this.shurikanUpgradeBButton,
            this.shurikanUpgradeCButton,
        );

        this.tooltipText = this.add.text(0, 0, '', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#00FF00',
            backgroundColor: '#000000',
            wordWrap: {
                width: 150,
            },
        }).setOrigin(.5, 1).setAlpha(0);

        this.checkUpgrades();
    }

    setupWeaponButton(x = 1200, y = 200, weapon = 'darkorb', icon = 'darkorb', scale = 1) {
        const button = this.add.image(x, y, icon)
            .setScale(scale)
            .setInteractive()
            .on('pointerover', () => button.setTint(0x7d7d7d))
            .on('pointerout', () => button.setTint())
            .on('pointerdown', (pointer) => {
                const slot = pointer.button === 0
                    ? 0
                    : 1;
                this.player.equipWeapon(weapon, slot)
            });

        return button;
    }

    setupButton(x = 1200, y = 200, icon = 'auraicon', scale = 1, tint = '0xFFFFFF', tooltip = '') {
        const button = this.add.image(x, y, icon)
            .setScale(scale)
            .setInteractive()
            .setTint(tint)
            .on('pointerover', (pointer) => {
                button.setTint(0x7d7d7d);
                // tooltip
                this.tooltipText.setText(tooltip);
                this.tooltipText.setPosition(pointer.x, pointer.y);
                this.tooltipText.setAlpha(1);
            })
            .on('pointerout', () => {
                button.setTint(tint)

                this.tooltipText.setText('');
                this.tooltipText.setAlpha(0);
            })
        button.baseTint = tint;
        return button;
    }

    resetButtons(button) {
        button.setInteractive();
        button.setTint(button.baseTint);
    }

    checkUpgrades() {
        if (GameManager.power.shurikanUpgradeA) {
            this.shurikanUpgradeAButton.disableInteractive();
            this.shurikanUpgradeAButton.setTint(0xFFFFFF);
        }
        if (GameManager.power.shurikanUpgradeB) {
            this.shurikanUpgradeBButton.disableInteractive();
            this.shurikanUpgradeBButton.setTint(0xFFFFFF);
        }
        if (GameManager.power.shurikanUpgradeC) {
            this.shurikanUpgradeCButton.disableInteractive();
            this.shurikanUpgradeCButton.setTint(0xFFFFFF);
        }


        if (GameManager.power.auraUpgradeA === 1) {

            this.auraUpgradeA0Button.disableInteractive();
            this.auraUpgradeA0Button.setTint(0xFFFFFF);
            this.auraUpgradeA1Button.disableInteractive();
            this.auraUpgradeA1Button.setTint(0x000000);

        }
        if (GameManager.power.auraUpgradeA === 2) {

            this.auraUpgradeA1Button.disableInteractive();
            this.auraUpgradeA1Button.setTint(0xFFFFFF);
            this.auraUpgradeA0Button.disableInteractive();
            this.auraUpgradeA0Button.setTint(0x000000);

        }
        if (GameManager.power.auraUpgradeB === 1) {

            this.auraUpgradeB0Button.disableInteractive();
            this.auraUpgradeB0Button.setTint(0xFFFFFF);
            this.auraUpgradeB1Button.disableInteractive();
            this.auraUpgradeB1Button.setTint(0x000000);

        }
        if (GameManager.power.auraUpgradeB === 2) {

            this.auraUpgradeB1Button.disableInteractive();
            this.auraUpgradeB1Button.setTint(0xFFFFFF);
            this.auraUpgradeB0Button.disableInteractive();
            this.auraUpgradeB0Button.setTint(0x000000);

        }
    }

}