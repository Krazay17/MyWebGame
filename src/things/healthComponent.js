export default class Health {
    constructor (healthMax){
        this.healthMax = healthMax;
        this.health = healthMax;
    }

    onAdd(actor) {
        this.actor = actor;
    }

    takeDamage(actor, damage) {
        this.health = Math.max(0, this.health -= damage);
        if (this.health === 0) {
            this.die(actor);
        }
    }

    die(actor) {
        console.log(this.actor, 'died');
        actor.updateMoney(this.healthMax);
        //this.actor.active(false);
        //this.actor.setVisible(false);
    }
}