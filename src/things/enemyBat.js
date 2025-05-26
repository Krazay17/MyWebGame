import BaseEnemy from "./_baseEnemy.js";

export default class Bat extends BaseEnemy {
    constructor(scene, x, y, id = 'bat') {
        super(scene, x, y, id)
        this.maxHealth = 2;
        this.health = 2;
        this.body.allowGravity = false;
    }
}