export default class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload()
    {
        this.load.audio('playerHit', 'Assets/PlayerGotHit.wav');
        this.load.audio('shurikanthrow', 'Assets/whip1.wav');
        this.load.audio('shurikanhit', 'Assets/shurikan.wav');
        this.load.image('sky', 'Assets/RedGalaxy2.png');
        this.load.image('skylayer1', 'Assets/SkyLayer1.png');
        this.load.image('skylayer2', 'Assets/SkyLayer2.png');
        this.load.image('dude', 'Assets/Dude.png');
        this.load.image('dudeCrouch', 'Assets/DudeCrouch.png');
        this.load.image('shurikan', 'Assets/shurikan.png');
    }

    create()
    {
        this.scene.start('MainGame');
    }
}