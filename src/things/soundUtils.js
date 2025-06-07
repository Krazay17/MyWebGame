// SoundPool.js
const lastPlayTimes = {};
const MIN_INTERVAL = 50; // ms per sound ID

export function playHitSound(scene, soundKey, options = {}) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;
    const lastTime = lastPlayTimes[soundKey] || 0;

    if (now - lastTime > (options.cooldown || MIN_INTERVAL)) {
        lastPlayTimes[soundKey] = now;

        // You can pass extra options like volume, detune, etc.
        scene.sound.play(soundKey, {
            volume: options.volume ?? 1,
            detune: options.detune ?? 0,
            rate: options.rate ?? 1
        });
    }
}
