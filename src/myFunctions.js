export function getProperty(obj) {
    if (!obj) return;
    const props = obj.properties?.reduce((acc, prop) => {
        acc[prop.name] = prop.value;
        return acc;
    }, {});
    return props;
}

export function changeCollision(object, x, y, xOffset = 0, yOffset = 0) {
    if (!object.body) return;
    object.body.setSize(x, y);
    object.body.setOffset(
        ((object.width - x) / 2) + xOffset,
        ((object.height - y) / 2) + yOffset
    );
}