import Pickup from "./Pickup.js";
import Enemy from "./Enemy.js";
import Bullet from "./bullet.js"

export default class SpawnManager {
    static instance;
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.sunMans = 0;
    }

    SpawnCoin(x, y) {
        const coin = new Pickup(this.scene, x, y, 'coin');
        this.scene.itemGroup.add(coin);
        coin.setGravity(0, 0);
        coin.setBounce(.9);
        coin.setScale(.2);
        this.scene.tweens.add({
            targets: coin,
            angle: 360,
            duration: 500,
            repeat: -1
        });

        return coin;
    }

    spawnSunMans(x, y) {
        const sunMan = new Enemy(this.scene, x, y, 'sunsheet', this, 3);
        this.scene.softEnemyGroup.add(sunMan);
        this.sunMans++;
        sunMan.setScale(.4);
        sunMan.scaleCollision(170, 170);
        sunMan.setBounce(1);
        sunMan.setCollideWorldBounds(true);
        sunMan.setVelocityX(-200);
        if (!this.scene.anims.get('sun')) {
            this.scene.anims.create({
                key: 'sun',
                frames: this.scene.anims.generateFrameNumbers('sunsheet', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        };
        sunMan.play('sun');

        return sunMan;
    }

    spawnTurret(x, y) {
        const turret = new Enemy(this.scene, x, y, 'turret', 6, false);
        turret.setVelocityY(50);
        turret.setBounce(1);
        turret.setCollideWorldBounds(true);

        const originalDie = turret.die.bind(turret);
        turret.die = (player) => {
            originalDie(player);

            this.scene.time.addEvent({
                delay: 5000,
                callback: () => this.SpawnTurret(x, y)
            });
        };
        return turret;
    }

    spawnBullets(x, y, amount) {
        for (var i = 0; i < amount; i++) {
            const bullet = new Bullet(this.scene, x, y + (i * 100), 'bullet');
            this.scene.softBulletGroup.add(bullet);
            bullet.setVelocityX(Phaser.Math.Between(-300, -200));
        };
    }

    spawnFireballs(x, y) {
        const bullet = new Bullet(this.scene, x, y, 'fireballsheet');
        this.scene.softBulletGroup.add(bullet);
        bullet.setVelocityX(-450);
        if (!this.scene.anims.get('fireball'))
            this.scene.anims.create({
                key: 'fireball',
                frames: this.scene.anims.generateFrameNumbers('fireballsheet', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        bullet.play('fireball');

        return bullet;
    }

    spawnDuck(x, y) {
        const duck = new Enemy(this.scene, x, y, 'duck', this, 200, false, true)
        this.scene.enemyGroup.add(duck);
        duck.setScale(.3);
    }
}