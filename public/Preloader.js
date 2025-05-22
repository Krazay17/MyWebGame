import GameManager from "./GameManager.js";

export default class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload()
    {
        this.load.audio('playerHit', 'Assets/PlayerGotHit.wav');
        this.load.audio('shurikanthrow', 'Assets/Whip1.wav');
        this.load.audio('shurikanhit', 'Assets/shurikan.wav');
        this.load.audio('pickup', 'Assets/SuccessBeep.wav');
        this.load.image('dude', 'Assets/Dude.png');
        this.load.image('dudecrouch', 'Assets/DudeCrouch.png');
        this.load.image('shurikan', 'Assets/shurikan.png');
        this.load.image('sword', 'Assets/shurikan.png');
    }

    create()
    {
        GameManager.load();

        window.toggleTeleport = () => {
            GameManager.debug.canTeleport = !GameManager.debug.canTeleport;
            console.log(GameManager.debug.canTeleport);
        };

        window.toggleDevMode = () => {
            GameManager.devMode = !GameManager.devMode;
            console.log(GameManager.devMode);
        };

        this.scene.start('MainGame');
    }
}