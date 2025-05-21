import NetworkManager from "./NetworkManager.js";

export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create()
    {
        this.input.mouse.disableContextMenu();
        if (!globalThis.networkManager) {
            globalThis.networkManager = new NetworkManager(this);
        }

        this.scene.start('Preloader');
    }
}