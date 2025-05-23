import Breakable from "./Breakable.js"

export default class Breakables extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene, {immovable: true, allowGravity: false})

    }

    spawnBox(x, y, health = 1)
    {
        const box = new Breakable(this.scene, x, y, 'boxsheet', health);
        this.add(box);
        
    }
}