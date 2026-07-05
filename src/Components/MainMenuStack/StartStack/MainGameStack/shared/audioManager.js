/**
 * audioManager -- a tiny singleton that coordinates the game's two kinds of
 * audio so they stop fighting each other:
 *
 *   - ONE persistent background-music channel (looping), and
 *   - fire-and-forget SFX (character voices, UI blips).
 *
 * Why this exists: background music and the character-voice scheduler are
 * independent `HTMLAudioElement`s. On some browsers, a short gesture-less
 * SFX `play()` grabs the page media session and *pauses the looping music*
 * -- which read as "music stopped working after character sounds were added".
 * The music channel here SELF-HEALS: if it gets paused while it should be
 * playing (media-session contention, a visibility blip), it resumes itself.
 * SFX never touch the music element, so a voice clip can't kill the music.
 *
 * Module-level singleton on purpose: the music element then survives React
 * remounts, giving gapless playback across renderer/settings changes.
 */

let musicEl = null;
let musicSrc = null;
let musicShouldPlay = false;

const ensureMusicEl = () => {
  if (musicEl || typeof Audio === 'undefined') {
    return musicEl;
  }
  musicEl = new Audio();
  musicEl.loop = true;
  // Self-heal: something outside our control (a short SFX taking the media
  // session, a tab blip) can pause the music. If it should still be playing,
  // resume it. stopMusic() flips musicShouldPlay false first, so an
  // intentional stop is never fought.
  musicEl.addEventListener('pause', () => {
    if (musicShouldPlay && !musicEl.ended && !document.hidden) {
      const p = musicEl.play();
      p?.catch?.(() => {});
    }
  });
  return musicEl;
};

/** Start (or switch to) a looping background track. Safe to call repeatedly. */
export const playMusic = (src) => {
  const el = ensureMusicEl();
  if (!el || !src) {
    return;
  }
  musicShouldPlay = true;
  if (musicSrc !== src) {
    musicSrc = src;
    el.src = src;
  }
  const p = el.play();
  // Rapid src swaps reject the prior play() with AbortError -- expected.
  p?.catch?.(() => {});
};

/** Stop background music and rewind. Disarms the self-heal. */
export const stopMusic = () => {
  musicShouldPlay = false;
  if (musicEl) {
    musicEl.pause();
    musicEl.currentTime = 0;
  }
};

export const isMusicPlaying = () => Boolean(musicEl && !musicEl.paused);

/**
 * Play a one-shot sound effect. Never interacts with the music element, so it
 * cannot interrupt the background track. Returns the element (or null).
 */
export const playSfx = (url, { volume = 0.6 } = {}) => {
  if (!url || typeof Audio === 'undefined') {
    return null;
  }
  try {
    const el = new Audio(url);
    el.volume = volume;
    const p = el.play();
    p?.catch?.(() => {});
    return el;
  } catch {
    return null;
  }
};

// Test/debug seam: probes can read music state without reaching into React.
if (typeof window !== 'undefined') {
  window.__audioManager = { isMusicPlaying, get musicEl() { return musicEl; } };
}
