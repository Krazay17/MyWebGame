import SoundUtil from "../things/soundUtils";

export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create()
    {
        this.input.mouse.disableContextMenu();
        this.scene.run('Preloader');
    }
}