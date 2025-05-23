import BaseGame from "./BaseGame.js";

export default class Level1 extends BaseGame {
    constructor() {
        super('Level1')
    }

    preload() {
        super.preload()
    }

    create() {
        this.setupQuick();
        this.setupPlatforms([[-100, 600], [100, 500], [400, 400]]);
    }
    
    update(time, delta){
        super.update(time, delta);
    }
}