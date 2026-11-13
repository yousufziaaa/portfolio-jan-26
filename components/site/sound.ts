/**
 * Interface sound, synthesised with Web Audio so there are no files to load.
 * Off until the visitor turns it on (browsers only allow audio after a
 * gesture anyway); the choice is remembered.
 *
 * Character: warm and soft, after the Devouring Details "Mantras" audio,
 * but voiced from ~300Hz up so laptop and phone speakers (which drop
 * almost everything below that) can actually play it. Everything is
 * unpitched noise shaped by filters, with no ringing tones, so nothing
 * reads as a mallet or a xylophone; it all runs through a gentle low-pass.
 * A click peaks around -13dBFS.
 */

const KEY = "sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    // Take the edge off everything: warm, slightly muffled.
    const warm = ctx.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 4500;
    warm.Q.value = 0.5;
    master.connect(warm).connect(ctx.destination);
  }
  return ctx;
}

// Play now if audio is running, otherwise once it has resumed (the first
// click after a reload, or Safari suspending it in the background).
function play(fn: (c: AudioContext) => void) {
  if (!enabled || !ctx) return;
  const c = ctx;
  if (c.state === "running") fn(c);
  else c.resume().then(() => fn(c), () => {});
}

export function soundEnabled() {
  return enabled;
}

export function initSound() {
  try {
    enabled = localStorage.getItem(KEY) === "on";
  } catch {}
  listeners.forEach((l) => l(enabled));
  // If sound was left on, the first click or key press unlocks it again.
  const unlock = () => {
    if (enabled) audio().resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

/** Call from a click handler: the click is the gesture that unlocks audio. */
export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  if (on) {
    audio();
    tick(1);
  }
  listeners.forEach((l) => l(on));
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function envelope(g: GainNode, t: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

// A short buffer of white noise, made once, shaped into every sound.
let noise: AudioBuffer | null = null;
function noiseBuffer(c: AudioContext) {
  if (!noise) {
    noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.12), c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** A burst of noise through a band-pass: the basic knock. */
function knock(c: AudioContext, t: number, freq: number, q: number, peak: number, decay: number, dest?: AudioNode) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  envelope(g, t, peak, decay);
  src.connect(bp).connect(g).connect(dest ?? master!);
  src.start(t, Math.random() * 0.05);
  src.stop(t + decay + 0.02);
}

let lastClink = 0;

// Placed left to right where the pendant hangs (they're 16px apart).
const pendantPan = (i: number) =>
  Math.max(-0.7, Math.min(0.7, (((i * 16 + 8) / window.innerWidth) * 2 - 1) * 0.7));

/**
 * Pendants knocking together: a dry wooden-bead tock, different every
 * time, sometimes with a smaller second knock as they settle, placed where
 * the pendant hangs. `strength` is 0..1.
 */
export function clink(index: number, strength: number) {
  // Only while audio is already running: a clink isn't worth waking it for.
  if (!enabled || !ctx || ctx.state !== "running") return;
  const c = ctx;
  const now = c.currentTime;
  if (now - lastClink < 0.04) return; // no machine-gunning
  lastClink = now;
  const s = Math.min(1, strength);
  const freq = 500 + Math.random() * 700;
  const peak = 0.15 + 0.4 * s;
  let dest: AudioNode = master!;
  if (c.createStereoPanner) {
    const pan = c.createStereoPanner();
    pan.pan.value = pendantPan(index);
    pan.connect(master!);
    dest = pan;
  }
  knock(c, now, freq, 2.2, peak, 0.018 + Math.random() * 0.01, dest);
  if (Math.random() < 0.35)
    knock(c, now + 0.012 + Math.random() * 0.02, freq * (0.85 + Math.random() * 0.3), 2.2, peak * 0.45, 0.015, dest);
}

/** A soft, low thock for clicks: a muffled knock with a little body. */
export function tick(strength = 1) {
  play((c) => {
    const now = c.currentTime;
    knock(c, now, 1050 + Math.random() * 120, 1.3, 0.55 * strength, 0.035);
    // Body: a very short thump that falls in pitch, too brief to be a note.
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(360, now);
    o.frequency.exponentialRampToValueAtTime(170, now + 0.045);
    envelope(g, now, 0.22 * strength, 0.045);
    o.connect(g).connect(master!);
    o.start(now);
    o.stop(now + 0.065);
  });
}
