import BaseEnemy from "./_baseEnemy.js";

export default class SunMan extends BaseEnemy {
    constructor(scene, x, y, health = 3) {
        super(scene, x, y, 'sunsheet', health)

        this.maxaccell = 400;
        this.damage = 5;

        if (!scene.anims.get('sunsheet')) {
            scene.anims.create({
                key: 'sunsheet',
                frames: scene.anims.generateFrameNumbers('sunsheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        };
        this.play('sunsheet')
        
        const lookForPlayer = scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if(this.distanceToPlayer() < 550){
                this.accelToPlayer(200, 400);
                }
            }
        })
        this.on('die', () => {
            scene.time.removeEvent(lookForPlayer);
    })
    }
}