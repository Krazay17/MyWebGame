export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create()
    {
        this.input.mouse.disableContextMenu();

        this.scene.start('Preloader');
    }
}