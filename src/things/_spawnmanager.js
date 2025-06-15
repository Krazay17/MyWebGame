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

    setupGroups() {
        this.batGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.sunmanGroup = this.scene.physics.add.group({ classType: SunMan, runChildUpdate: true, allowGravity: false });
        this.bulletGroup = this.scene.physics.add.group({ allowGravity: false });
        this.duckGroup = this.scene.physics.add.group({ immovable: true });
        this.softBulletGroup = this.scene.physics.add.group({ allowGravity: false });
        this.itemGroup = this.scene.physics.add.group();
        this.staticItemGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });
    }

    getGroups() {
        return [
            { group: this.batGroup, handler: 'enemyHit', zap: true, walls: true },
            { group: this.sunmanGroup, handler: 'enemyHit', zap: true, walls: false },
            { group: this.duckGroup, handler: 'enemyHit', zap: true, walls: true },
            { group: this.bulletGroup, handler: 'bulletHit', zap: true, walls: false },
            { group: this.softBulletGroup, handler: 'bulletHit', zap: true, walls: false },
            { group: this.itemGroup, handler: 'itemHit', zap: false, walls: true },
            { group: this.staticItemGroup, handler: 'itemHit', zap: false, walls: false }
        ];
    }

    spawnBat(x, y) {
        const bat = new Bat(this.scene, x, y, 'bat', 2)
        this.batGroup.add(bat);

        return bat;
    }

    spawnSunMans(x, y, health) {
        const sunMan = new SunMan(this.scene, x, y, health);
        this.sunmanGroup.add(sunMan);

        return sunMan;
    }

    spawnDuck(x, y, health = 5, scale = .3) {
        const duck = new Duck(this.scene, x, y, 'duck', health)
        this.duckGroup.add(duck);
        duck.setScale(scale);

        return duck;
    }

    SpawnCoin(x, y) {
        const coin = new Pickup(this.scene, x, y, 'coin');
        this.itemGroup.add(coin);
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

    spawnSourceBlock(x, y) {
        const block = this.scene.walkableGroup.create(x, y, 'boxsheet')
        this.scene.add.existing(block);
        this.scene.physics.add.existing(block);

        if (!this.scene.anims.get('box'))
            this.scene.anims.create({
                key: 'box',
                frames: this.scene.anims.generateFrameNumbers('boxsheet', {start: 0, end: 3}),
                frameRate: 6,
                repeat: -1,
                yoyo: true,
        })
        block.play('box')
    }

    spawnTurret(x, y) {
        const turret = new Enemy(this.scene, x, y, 'turret', 10);
        this.sunmanGroup.add(turret)
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
            this.softBulletGroup.add(bullet);
            bullet.setVelocityX(Phaser.Math.Between(-300, -200));
        };
    }

    spawnBullet(x, y) {
        const bullet = new Bullet(this.scene, x, y, 'bullet');
        this.softBulletGroup.add(bullet);
        bullet.setVelocityX(-300);
    }

    spawnFireballs(x, y) {
        const bullet = new Bullet(this.scene, x, y, 'fireballsheet');
        this.softBulletGroup.add(bullet);
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



}