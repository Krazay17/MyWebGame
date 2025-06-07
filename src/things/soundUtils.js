let lastHitSoundTime = 0;

export function playHitSound(scene, soundKey) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;

    if (now - lastHitSoundTime > 50) {
        lastHitSoundTime = now;
        scene.sound.play(soundKey);
    }
}
