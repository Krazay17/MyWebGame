import { getProperty } from "../myFunctions";

export default class LaserSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, player, obj) {
        super(scene, x, y, 0, 16, 'zap');
        // ...
        this.player = player;
        const props = getProperty(obj);

        if (!this.scene.laserList) {
            this.scene.laserList = {}
        }
        this.scene.laserList[props?.index] = this;
        this.target = this.scene.laserList[props?.otherLaser];

        this.setOrigin(0, 0.5);
        this.setTint('0xFF0000');
        scene.add.existing(this);
        console.log(this.getWorldPoint());

        if (!this.target) this.deactivate();
        //this.updateZapLine();

    }

    init(target) {
        this.target = target;
        this.updateZapLine();
        this.activate();
    }

    preUpdate(time, delta) {
        if (!this.target) return;
        this.updateZapLine();
        this.tilePositionX += 10;
    }

    deactivate() {
        this.setVisible(false);
        this.setActive(false);
    }

    activate() {
        this.setActive(true);
        this.setVisible(true);
    }
    boxTrace() {
        const RectRay = this.polygonRay();

        // this.scene.graphics = this.scene.add.graphics();
        // this.scene.graphics.clear();
        // this.scene.graphics.lineStyle(2, 0xff0000);
        // this.scene.graphics.lineStyle(1, 0x00ff00);
        // this.scene.graphics.strokeLineShape(ray);

        const bounds = this.player.getBounds();
        const closestPoint = getClosestPointOnRect(bounds, this.getWorldPoint());
        const toTarget = closestPoint.clone().subtract(this.getWorldPoint());
        const distanceToTarget = toTarget.length();

        if (distanceToTarget >  200) return;

        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, RectRay)) {
            const hitRec = Phaser.Geom.Rectangle.Intersection(bounds, RectRay);
            const hit = { x: hitRec.centerX, y: hitRec.centerY };
            this[handler]?.(target, true, hit);

            // this.scene.graphics.fillStyle(0x00ff00, 0.5);
            // this.scene.graphics.fillRectShape(target.getBounds());
        }
    }

    polygonRay() {
        const start = new Phaser.Math.Vector2(this.x, this.y);
        const end = new Phaser.Math.Vector2(this.target.x, this.target.y);
        const dirX = this.x - this.target.x;
        const dirY = this.y - this.target.y;

        // Create perpendicular vector to the direction
        const perp = new Phaser.Math.Vector2(-dirY, dirX).scale(25);

        // Build a rectangle as a polygon from the start point
        const p1 = start.clone().add(perp);
        const p2 = end.clone().add(perp);
        const p3 = end.clone().subtract(perp);
        const p4 = start.clone().subtract(perp);

        const rayPoly = new Phaser.Geom.Polygon([p1, p2, p3, p4]);
        const rayRect = Phaser.Geom.Polygon.GetAABB(rayPoly);
        Phaser.Geom.Rectangle.Inflate(rayRect, 1, 1)

        //Debug draw
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1, 0xffff00);
        graphics.strokePoints(rayPoly.points, true);

        return rayRect;
    }

    updateZapLine() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        this.setRotation(angle);
        this.displayWidth = length;
    }


}
