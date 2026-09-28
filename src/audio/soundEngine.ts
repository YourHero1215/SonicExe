import {
  NoteSpecialType,
  OpponentCharacterId,
  PlayerCharacterId,
  SongId,
} from '../types/game';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class FnfSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.45;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    this.ensureContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume * 0.65)),
        this.ctx.currentTime,
        0.02
      );
    }
  }

  // Play character vocal synth for either Boyfriend or any Sonic.exe opponent
  public playVocalNote(
    midi: number,
    isPlayer: boolean,
    character: OpponentCharacterId | PlayerCharacterId,
    durationMs = 180,
    special: NoteSpecialType = 'normal',
    volume = 0.75
  ) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    if (special === 'ring') {
      this.playRingCollect();
    }

    const now = ctx.currentTime;
    const durSec = Math.max(0.11, Math.min(0.65, durationMs / 1000));
    const freq = midiToFreq(midi);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    if (isPlayer) {
      // Boyfriend classic FNF formant vocal ("beep-bop")
      osc1.type = character === 'bf-pixel' ? 'square' : 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.004, now);
      // Slight pitch scoop up like BF's voice samples
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.025, now + 0.035);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.09);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1150, now);
      filter.Q.value = 2.8;
    } else {
      // Opponent specific voice timbres
      if (character === 'majin' || character === 'majin-og') {
        // Sega CD Majin brassy synth lead
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 0.5, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2100, now);
        filter.Q.value = 4.0;
      } else if (character === 'xenophanes') {
        // Xenophanes aggressive dual-octave distorted growl
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq * 0.5, now);
        osc2.frequency.setValueAtTime(freq * 1.01, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1650, now);
        filter.Q.value = 5.5;
      } else if (character === 'pixel-exe') {
        // 16-bit Genesis chiptune pulse
        osc1.type = 'square';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);
      } else if (character === 'tails-soul') {
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq * 1.0, now);
        osc2.frequency.setValueAtTime(freq * 1.5, now);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1350, now);
        filter.Q.value = 3.2;
      } else if (character === 'knuckles-soul' || character === 'eggman-soul') {
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq * 0.5, now);
        osc2.frequency.setValueAtTime(freq * 0.75, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(980, now);
        filter.Q.value = 4.2;
      } else {
        // Classic Sonic.exe raspy horror lead
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq * 0.5, now);
        osc2.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1450, now);
        filter.Q.value = 4.5;
      }
    }

    const peakGain = Math.min(0.32, 0.24 * volume);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.012);
    env.gain.exponentialRampToValueAtTime(peakGain * 0.65, now + durSec * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durSec + 0.02);
    osc2.stop(now + durSec + 0.02);
  }

  // Backing rhythm beat (Kick, Snare, Genesis Bassline) triggered every half-beat
  public playBackingSubBeat(songId: SongId, subBeatIndex: number, volume = 0.7) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || volume <= 0.01) return;

    const now = ctx.currentTime;
    const step = subBeatIndex % 8; // 8 eighth-notes per 4/4 bar

    // Kick on 0, 3, 4
    if (step === 0 || step === 3 || step === 4) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.11);

      gain.gain.setValueAtTime(0.28 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    // Snare on 2 and 6
    if (step === 2 || step === 6) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);

      gain.gain.setValueAtTime(0.2 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Driving Sega Genesis FM Bass note on every eighth note
    const rootMidi =
      songId === 'endless' || songId === 'endless-og'
        ? 41
        : songId === 'triple-trouble'
          ? 39
          : songId.includes('you-cant-run')
            ? 36
            : 38;
    const progOffsets = [0, 0, 3, 3, 5, 5, 6, 5];
    const barNum = Math.floor(subBeatIndex / 8) % 4;
    const bassNote =
      rootMidi + progOffsets[step] + (barNum === 2 ? 3 : barNum === 3 ? -2 : 0);

    const bassOsc = ctx.createOscillator();
    const bassFilter = ctx.createBiquadFilter();
    const bassGain = ctx.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(midiToFreq(bassNote), now);
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(620, now);
    bassFilter.Q.value = 3.5;

    bassGain.gain.setValueAtTime(0.14 * volume, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start(now);
    bassOsc.stop(now + 0.15);
  }

  // Iconic Sonic Golden Ring stereo chime
  public playRingCollect() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = [987.77, 1318.51, 1567.98, 1975.53]; // B5, E6, G6, B6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.16, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.24);
    });
  }

  public playMissSound() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(68, now + 0.14);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playStaticBurst() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  public playMenuTick(high = false) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(high ? 880 : 520, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const soundEngine = new FnfSoundEngine();
