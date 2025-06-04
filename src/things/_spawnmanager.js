import Pickup from "./Pickup.js";
import Enemy from "./_baseEnemy.js";
import Bullet from "./bullet.js"
import Duck from "./enemyDuck.js"
import Bat from "./enemyBat.js"
import SunMan from "./enemySunman.js";

export default class SpawnManager {
    static instance;
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
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

    spawnSunMans(x, y, heatlh) {
        const sunMan = new SunMan(this.scene, x, y, heatlh);
        this.scene.softEnemyGroup.add(sunMan);
        sunMan.body.allowGravity = false;
        sunMan.setBounce(1);
        sunMan.setScale(.4);
        sunMan.scaleCollision(170, 170);
        sunMan.setCollideWorldBounds(true);
        sunMan.body.setMaxSpeed(1000);
        return sunMan;
    }

    spawnTurret(x, y) {
        const turret = new Enemy(this.scene, x, y, 'turret', 10);
        this.scene.staticEnemyGroup.add(turret)
        turret.body.allowGravity = false;
        turret.setVelocityY(50);
        turret.setBounce(1);
        turret.setCollideWorldBounds(true);

        const originalDie = turret.die.bind(turret);
        turret.die = (player) => {
            originalDie(player);

            this.scene.time.addEvent({
                delay: 5000,
                callback: () => this.spawnTurret(x, y)
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
        const duck = new Duck(this.scene, x, y, 'duck', 40)
        this.scene.enemyGroup.add(duck);
        duck.body.setBounce(.55);
        duck.setScale(.3);

        return duck;
    }

    spawnBat(x, y) {
        const bat = new Bat(this.scene, x, y, 'bat', 2)
        this.scene.enemyGroup.add(bat);
        bat.body.allowGravity = false;
        bat.body.setBounce(1);
        bat.setScale(1);
        return bat;
    }

}