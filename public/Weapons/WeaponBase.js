import WeaponGroup from './WeaponGroup.js';


export default class WeaponBase {
    constructor(scene, player, group) {
        this.scene = scene;
        this.player = player;
        this.group = group;
        this.scene.events.once('shutdown', this.destroy, this);
        this.scene.events.once('destroy', this.destroy, this);
        this.weaponGroup = new WeaponGroup(scene, player);

        this.cooldown = false;
        this.cooldownDelay = 200;
        this.baseCooldown = this.cooldownDelay;
        this.spamAdd = 50;
    }

    update(time, delta) {
        if (!this.cooldown)
            this.cooldownDelay = Math.max(this.baseCooldown, this.cooldownDelay -= delta*.65);

        console.log(this.cooldownDelay);
    }

    getGroup() {
        return this.weaponGroup;
    }

    canFire() {
        return !this.cooldown;
    }

    startCooldown() {
        this.cooldown = true;
        this.scene.time.delayedCall(this.cooldownDelay, () => {
            this.cooldown = false;
        });
        this.spamTimer();
    }

    spamTimer() {
        this.cooldownDelay += this.spamAdd;
    }

    destroy() {
    this.scene.events.off('update', this.update, this);
    // any other cleanup here
    }

    fire(pointer) {}
}