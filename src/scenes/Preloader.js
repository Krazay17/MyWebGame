import GameManager from "../things/GameManager.js";

export default class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload()
    {
        this.load.image('sky2', 'assets/Sky2.png')
        this.load.image('sky2layer1', 'assets/Sky2Layer1.png')
        this.load.image('sky2layer2', 'assets/Sky2Layer2.png')
        this.load.audio('playerHit', 'assets/PlayerGotHit.wav');
        this.load.audio('shurikanthrow', 'assets/Whip1.wav');
        this.load.audio('shurikanhit', 'assets/shurikan.wav');
        this.load.audio('pickup', 'assets/SuccessBeep.wav');
        this.load.audio('homemusic', 'assets/HomeMusic.wav');
        this.load.image('dudecrouch', 'assets/DudeCrouch.png');
        this.load.image('shurikan', 'assets/shurikan.png');
    }

    create()
    {
        GameManager.load();

        window.secretTeleport = () => {
            GameManager.debug.canTeleport = !GameManager.debug.canTeleport;
        };

        window.secretDevMode = () => {
            GameManager.devMode = !GameManager.devMode;
        };

        this.scene.start(GameManager.area);
    }
}