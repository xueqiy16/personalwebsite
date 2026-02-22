/**
 * Audio manager — procedural SFX via Web Audio API + background music via Howler.js.
 *
 * All SFX are synthesised so the site works out-of-the-box without audio files.
 * Background music is loaded from `/audio/bg-music.mp3` (optional — a console
 * note is logged if the file is missing).
 *
 * Usage:
 *   import { audio } from "@/lib/audio";
 *   audio.playHover();
 *   audio.playClick();
 *   audio.playBack();
 *   audio.setMuted(true);
 *   audio.startMusic();
 */

import { Howl } from "howler";

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private bgMusic: Howl | null = null;
  private musicStarted = false;
  private unlocked = false;
  private unlockBound: (() => void) | null = null;

  // ── Internals ──────────────────────────────────────────────

  /** Lazily create (or resume) the AudioContext + master gain node. */
  private getContext(): { ctx: AudioContext; master: GainNode } | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return { ctx: this.ctx, master: this.masterGain! };
  }

  /**
   * Register a one-time global listener so the very first user gesture
   * (click, tap, keypress — anywhere on the page) unlocks audio and
   * starts music instantly. Browsers require at least one interaction
   * before allowing AudioContext playback.
   */
  enableAutoUnlock() {
    if (typeof window === "undefined" || this.unlockBound) return;

    this.unlockBound = () => {
      if (this.unlocked) return;
      this.unlocked = true;

      // Resume the AudioContext if it was created in suspended state
      if (this.ctx?.state === "suspended") {
        this.ctx.resume();
      }

      // Start music immediately on first interaction
      this.startMusic();

      // Clean up all listeners
      const events = ["click", "touchstart", "keydown", "pointerdown"];
      events.forEach((e) =>
        document.removeEventListener(e, this.unlockBound!),
      );
    };

    const events = ["click", "touchstart", "keydown", "pointerdown"];
    events.forEach((e) =>
      document.addEventListener(e, this.unlockBound!, { once: false, passive: true }),
    );
  }

  // ── Public API ─────────────────────────────────────────────

  /** Update global mute state for both SFX and music. */
  setMuted(muted: boolean) {
    this.muted = muted;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : 1,
        this.ctx.currentTime,
      );
    }

    if (this.bgMusic) {
      this.bgMusic.mute(muted);
    }
  }

  // ── SFX (synthesised) ─────────────────────────────────────

  /** Soft high-pitched ping — portal hover. */
  playHover() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /** Two-note ascending chime — portal click / navigate. */
  playClick() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    const notes = [660, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const start = ctx.currentTime + i * 0.09;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  /** Gentle descending tone — back navigation. */
  playBack() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Soft shimmer — overlay open / transition. */
  playTransition() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    // Three staggered sine tones creating a shimmer
    const freqs = [520, 660, 784];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const start = ctx.currentTime + i * 0.06;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.42);
    });
  }

  /** Soft tap — character footstep (short click). */
  playFootstep() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  }

  /** Stone grinding — ring rotation feedback. */
  playRotate() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.42);
  }

  /** Two descending tones — path blocked. */
  playBlocked() {
    if (this.muted) return;
    const env = this.getContext();
    if (!env) return;
    const { ctx, master } = env;

    [440, 330].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.17);
    });
  }

  // ── Background Music (Howler.js) ──────────────────────────

  /**
   * Preload the background music so it's ready to play instantly.
   * Call this early (e.g. when the splash screen mounts).
   */
  preloadMusic() {
    if (typeof window === "undefined") return;
    if (this.bgMusic) return;

    this.bgMusic = new Howl({
      src: ["/audio/Pachelbel - Canon in D-dur.mp3"],
      loop: true,
      volume: 0.25,
      preload: true,
      mute: this.muted,
      onloaderror: () => {
        console.info(
          "[Audio] No background music found — check that the file exists in public/audio/.",
        );
      },
    });
  }

  /**
   * Start the ambient background loop.
   * If preloadMusic() was called earlier, playback begins instantly.
   */
  startMusic() {
    if (typeof window === "undefined") return;
    if (this.musicStarted) return;
    this.musicStarted = true;

    // If not preloaded yet, create the Howl now
    if (!this.bgMusic) {
      this.preloadMusic();
    }

    this.bgMusic?.play();
  }
}

/** Singleton audio manager — import this wherever SFX or music is needed. */
export const audio = new AudioManager();
