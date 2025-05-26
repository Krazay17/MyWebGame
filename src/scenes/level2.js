import BaseGame from "./_basegame.js";

export default class level2 extends BaseGame {
    constructor () {
        super('level2')
    }

    preload() {
        super.preload();
    }

    create() {
        this.setupQuick();
        this.movingPlatforms();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    movingPlatforms() {
        this.movingPlatformPos = [[0, 600], [-100, 500], [100, 600]];
        this.movingPlatformPos.forEach(pos => this.walkableGroup.create(pos[0], pos[1], 'platform'));
    }
}