import GameManager from "./GameManager.js";
import NetworkManager from "./NetworkManager.js";

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
    }

    create()
    {
        GameManager.load();

        this.scene.start('MainGame');
    }
}