import WeaponProjectile from "./_baseWeaponProjectile";

export default class SwordWave extends WeaponProjectile {
    constructor (scene, x, y, player, weapon) {
        super(scene, x, y, 'swordwave', player, weapon);
        this.baseDamage = 2;
        this.setScale(.11);
        this.play('swordwave');
        //this.ignoreWall = true;

        scene.time.delayedCall(600, () => {
            this.destroy();
        })
    }
}