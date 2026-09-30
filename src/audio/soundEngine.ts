import {
  NoteSpecialType,
  OpponentCharacterId,
  PlayerCharacterId,
  SongId,
} from '../types/game';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export interface LoadedOggStem {
  id: string;
  name: string;
  durationSec: number;
  buffer: AudioBuffer;
  role: 'inst' | 'voices-bf' | 'voices-opp' | 'voices-combined' | 'alt';
  targetSongId: SongId;
  isBuiltIn?: boolean;
}

export const PERMANENT_OGG_STEM_LINKS: Partial<Record<SongId, string[]>> = {
  'too-slow': ['Inst.ogg', 'Voices.ogg', 'Voices-bf.ogg', 'Voices-sonicexe.ogg'],
  'too-slow-encore': [
    'Inst-erect.ogg',
    'Voices-bf-erect.ogg',
    'Voices-sonicexe-erect.ogg',
    'sonicexefake.ogg',
  ],
  'you-cant-run': [
    'Inst (you cant run).ogg',
    'Voices (you cant run).ogg',
    'Inst.ogg',
    'Voices.ogg',
    'Voices-bf.ogg',
    'Voices-sonicexep2.ogg',
  ],
  'you-cant-run-encore': [
    'Inst-erect (you cant run).ogg',
    'Voices-erect (you cant run).ogg',
    'Inst-erect.ogg',
    'Voices-erect.ogg',
    'Voices-bf-erect.ogg',
    'Voices-sonicexep2-erect.ogg',
  ],
  endless: ['Inst.ogg', 'Voices-bf.ogg', 'Voices-majin.ogg'],
  'endless-og': ['Inst.ogg', 'Voices-bf.ogg', 'Voices-majin.ogg'],
};

export const BUILT_IN_SONG_OGG_URLS: Record<
  SongId,
  { name: string; url: string; role: LoadedOggStem['role'] }[]
> = {
  'too-slow': [
    { name: 'Inst.ogg', url: '/audio/too-slow/Inst.ogg', role: 'inst' },
    {
      name: 'Voices.ogg',
      url: '/audio/too-slow/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  'too-slow-encore': [
    {
      name: 'Inst-erect.ogg',
      url: '/audio/too-slow-encore/Inst.ogg',
      role: 'inst',
    },
    {
      name: 'Voices-erect.ogg',
      url: '/audio/too-slow-encore/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  'you-cant-run': [
    {
      name: 'Inst (you cant run).ogg',
      url: '/audio/you-cant-run/Inst.ogg',
      role: 'inst',
    },
    {
      name: 'Voices (you cant run).ogg',
      url: '/audio/you-cant-run/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  'you-cant-run-encore': [
    {
      name: 'Inst-erect (you cant run).ogg',
      url: '/audio/you-cant-run/Inst.ogg',
      role: 'inst',
    },
    {
      name: 'Voices-erect (you cant run).ogg',
      url: '/audio/you-cant-run/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  endless: [
    { name: 'Inst.ogg', url: '/audio/endless/Inst.ogg', role: 'inst' },
    {
      name: 'Voices.ogg',
      url: '/audio/endless/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  'endless-og': [
    { name: 'Inst.ogg', url: '/audio/endless-og/Inst.ogg', role: 'inst' },
    {
      name: 'Voices.ogg',
      url: '/audio/endless-og/Voices.ogg',
      role: 'voices-combined',
    },
  ],
  'triple-trouble': [
    { name: 'Inst.ogg', url: '/audio/triple-trouble/Inst.ogg', role: 'inst' },
    {
      name: 'Voices.ogg',
      url: '/audio/triple-trouble/Voices.ogg',
      role: 'voices-combined',
    },
  ],
};

const IDB_NAME = 'sonicexe_ogg_stems_v3_db';
const IDB_STORE = 'song_ogg_stems';

function openStemsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class FnfSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Synchronized .ogg stems stored with automatic routing per song
  private allStems: LoadedOggStem[] = [];
  private rawBufferCache = new Map<string, Promise<ArrayBuffer | null>>();
  private loadingSongs = new Set<SongId>();
  private preloadPromises = new Map<SongId, Promise<LoadedOggStem[]>>();
  private activeSongId: SongId = 'too-slow';
  private activeSourceNodes: {
    source: AudioBufferSourceNode;
    gain: GainNode;
    role: LoadedOggStem['role'];
  }[] = [];
  private stemStartCtxTime = 0;
  private stemPausedOffsetSec = 0;
  private stemsPlaying = false;

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
      this.masterGain.gain.value = 0.55;
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
        Math.max(0, Math.min(1, volume * 0.75)),
        this.ctx.currentTime,
        0.02
      );
    }
  }

  private classifyStemRole(filename: string): LoadedOggStem['role'] {
    const lower = filename.toLowerCase();
    if (lower.includes('bf') || lower.includes('player')) return 'voices-bf';
    if (
      lower.includes('majin') ||
      lower.includes('sonicexep2') ||
      lower.includes('sonicexe') ||
      lower.includes('sonicexefake') ||
      lower.includes('dad') ||
      lower.includes('opp')
    ) {
      return 'voices-opp';
    }
    if (lower.includes('voice') || lower.includes('vocal')) {
      return 'voices-combined';
    }
    if (lower.includes('inst')) return 'inst';
    return 'alt';
  }

  /**
   * Routes uploaded .ogg files to the right song:
   * - Everything with "you cant run" (or "you-cant-run", "youcantrun", "ycr", "sonicexep2") in the name goes to You Can't Run (or You Can't Run Encore if "erect"/"encore").
   * - "sonicexefake.ogg" is strictly & exclusively routed to "too-slow-encore".
   * - If uploaded in a mixed batch alongside "you cant run" files, other files without "you cant run" go to "too-slow" (or "too-slow-encore" if "erect"/"encore").
   * - Otherwise, generic filenames (like Inst.ogg / Voices.ogg) link to the currently selected song (contextSongId).
   */
  private resolveTargetSongId(
    filename: string,
    contextSongId: SongId = 'too-slow',
    isMixedBatchWithYcr = false
  ): SongId {
    const lower = filename.toLowerCase();
    // Strict rule: sonicexefake.ogg is ONLY applied to Too Slow Encore
    if (lower.includes('sonicexefake')) {
      return 'too-slow-encore';
    }
    // Plug everything into You Can't Run that has the name "you cant run" on it
    if (
      lower.includes('you cant run') ||
      lower.includes("you can't run") ||
      lower.includes('you-cant-run') ||
      lower.includes('you_cant_run') ||
      lower.includes('youcantrun') ||
      lower.includes('sonicexep2') ||
      lower.includes('ycr')
    ) {
      if (lower.includes('erect') || lower.includes('encore')) {
        return 'you-cant-run-encore';
      }
      return 'you-cant-run';
    }
    if (lower.includes('majin') || lower.includes('endless')) {
      return contextSongId === 'endless-og' ? 'endless-og' : 'endless';
    }
    if (lower.includes('triple') || lower.includes('xeno')) {
      return 'triple-trouble';
    }
    if (
      lower.includes('sonicexe') ||
      lower.includes('tooslow') ||
      lower.includes('too-slow') ||
      lower.includes('too slow')
    ) {
      if (lower.includes('erect') || lower.includes('encore')) {
        return 'too-slow-encore';
      }
      return 'too-slow';
    }
    // If part of a mixed upload batch containing "you cant run" files, route the other files to Too Slow
    if (isMixedBatchWithYcr) {
      if (lower.includes('erect') || lower.includes('encore')) {
        return 'too-slow-encore';
      }
      return 'too-slow';
    }
    // Otherwise route to the selected song in the UI (upgrading to Encore if filename says erect/encore)
    if (lower.includes('erect') || lower.includes('encore')) {
      if (contextSongId === 'too-slow') return 'too-slow-encore';
      if (contextSongId === 'you-cant-run') return 'you-cant-run-encore';
    }
    return contextSongId;
  }

  private fetchRawOggBuffer(url: string): Promise<ArrayBuffer | null> {
    let cached = this.rawBufferCache.get(url);
    if (!cached) {
      cached = fetch(url)
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .catch(() => null);
      this.rawBufferCache.set(url, cached);
    }
    return cached;
  }

  public isSongLoading(songId: SongId): boolean {
    return this.loadingSongs.has(songId);
  }

  public async preloadSongStems(songId: SongId): Promise<LoadedOggStem[]> {
    const existing = this.getStemsForSong(songId);
    if (existing.length >= 2) {
      return existing;
    }

    const activePromise = this.preloadPromises.get(songId);
    if (activePromise) {
      return activePromise;
    }

    const builtInSpecs = BUILT_IN_SONG_OGG_URLS[songId] || [];
    if (builtInSpecs.length === 0) {
      return existing;
    }

    // Start network fetches immediately (even before AudioContext is active)
    for (const spec of builtInSpecs) {
      this.fetchRawOggBuffer(spec.url);
    }

    const loadTask = (async () => {
      this.loadingSongs.add(songId);
      try {
        const rawBuffers = await Promise.all(
          builtInSpecs.map((spec) => this.fetchRawOggBuffer(spec.url))
        );
        const ctx = this.ensureContext();
        if (!ctx) return this.getStemsForSong(songId);

        for (let i = 0; i < builtInSpecs.length; i++) {
          const spec = builtInSpecs[i];
          const raw = rawBuffers[i];
          if (!raw) continue;
          const stemId = `builtin:${songId}:${spec.name}`;
          if (this.allStems.some((s) => s.id === stemId)) continue;

          try {
            const copy = raw.slice(0);
            const audioBuf = await ctx.decodeAudioData(copy);
            const stem: LoadedOggStem = {
              id: stemId,
              name: spec.name,
              durationSec: audioBuf.duration,
              buffer: audioBuf,
              role: spec.role,
              targetSongId: songId,
              isBuiltIn: true,
            };
            const idx = this.allStems.findIndex((s) => s.id === stemId);
            if (idx >= 0) {
              this.allStems[idx] = stem;
            } else {
              this.allStems.push(stem);
            }
          } catch {
            // ignore decode failure
          }
        }
      } finally {
        this.loadingSongs.delete(songId);
        this.preloadPromises.delete(songId);
      }
      return this.getStemsForSong(songId);
    })();

    this.preloadPromises.set(songId, loadTask);
    return loadTask;
  }

  public getCustomStemsForSong(songId: SongId): LoadedOggStem[] {
    return this.allStems.filter(
      (s) => s.targetSongId === songId && !s.isBuiltIn
    );
  }

  public getStemsForSong(songId: SongId): LoadedOggStem[] {
    // Manually added custom .ogg stems always take priority over built-in stems
    const custom = this.getCustomStemsForSong(songId);
    if (custom.length > 0) {
      return custom;
    }
    if (songId === 'endless-og') {
      const ogCustom = this.getCustomStemsForSong('endless');
      if (ogCustom.length > 0) return ogCustom;
      const ogStems = this.allStems.filter((s) => s.targetSongId === 'endless-og');
      if (ogStems.length > 0) return ogStems;
      return this.allStems.filter((s) => s.targetSongId === 'endless');
    }
    return this.allStems.filter((s) => s.targetSongId === songId);
  }

  public getAllLoadedStems(): LoadedOggStem[] {
    return this.allStems;
  }

  public getEndlessStems(): LoadedOggStem[] {
    return this.getStemsForSong('endless');
  }

  public hasOggStemsForSong(songId: SongId): boolean {
    return this.getStemsForSong(songId).length > 0;
  }

  public hasEndlessOggStems(): boolean {
    return this.hasOggStemsForSong('endless');
  }

  public async restoreSavedEndlessStems(): Promise<LoadedOggStem[]> {
    // Immediately kick off pre-fetching for Too Slow and You Can't Run
    this.preloadSongStems('too-slow').catch(() => {});
    this.preloadSongStems('you-cant-run').catch(() => {});

    try {
      const db = await openStemsDb();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const allRecords: {
        id?: string;
        name: string;
        targetSongId?: SongId;
        arrayBuffer: ArrayBuffer;
      }[] = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      if (allRecords.length > 0) {
        const ctx = this.ensureContext();
        if (ctx) {
          const hasYcrInSaved = allRecords.some((r) => {
            const l = r.name.toLowerCase();
            return (
              l.includes('you cant run') ||
              l.includes("you can't run") ||
              l.includes('you-cant-run') ||
              l.includes('youcantrun') ||
              l.includes('sonicexep2') ||
              l.includes('ycr')
            );
          });
          for (const rec of allRecords) {
            try {
              const copy = rec.arrayBuffer.slice(0);
              const audioBuf = await ctx.decodeAudioData(copy);
              const resolvedSongId = this.resolveTargetSongId(
                rec.name,
                rec.targetSongId || 'too-slow',
                hasYcrInSaved
              );
              const stemId = `custom:${resolvedSongId}:${rec.name}`;
              const stem: LoadedOggStem = {
                id: stemId,
                name: rec.name,
                durationSec: audioBuf.duration,
                buffer: audioBuf,
                role: this.classifyStemRole(rec.name),
                targetSongId: resolvedSongId,
                isBuiltIn: false,
              };
              const existingIdx = this.allStems.findIndex(
                (s) => s.id === stemId
              );
              if (existingIdx >= 0) {
                this.allStems[existingIdx] = stem;
              } else {
                this.allStems.push(stem);
              }
            } catch {
              // ignore corrupt buffer
            }
          }
        }
      }
    } catch {
      // ignore IDB errors
    }
    return this.allStems;
  }

  public async loadOggFilesForSong(
    files: FileList | File[],
    contextSongId: SongId
  ): Promise<LoadedOggStem[]> {
    const ctx = this.ensureContext();
    if (!ctx) return this.allStems;

    const fileArr = Array.from(files);
    const hasYcrFile = fileArr.some((f) => {
      const l = f.name.toLowerCase();
      return (
        l.includes('you cant run') ||
        l.includes("you can't run") ||
        l.includes('you-cant-run') ||
        l.includes('you_cant_run') ||
        l.includes('youcantrun') ||
        l.includes('sonicexep2') ||
        l.includes('ycr')
      );
    });
    const hasNonYcrFile = fileArr.some((f) => {
      const l = f.name.toLowerCase();
      return !(
        l.includes('you cant run') ||
        l.includes("you can't run") ||
        l.includes('you-cant-run') ||
        l.includes('you_cant_run') ||
        l.includes('youcantrun') ||
        l.includes('sonicexep2') ||
        l.includes('ycr')
      );
    });
    const isMixedBatchWithYcr = hasYcrFile && hasNonYcrFile;

    const newlyLoaded: LoadedOggStem[] = [...this.allStems];

    for (const file of fileArr) {
      try {
        const rawBuf = await file.arrayBuffer();
        const copyForDecode = rawBuf.slice(0);
        const audioBuffer = await ctx.decodeAudioData(copyForDecode);
        const targetSongId = this.resolveTargetSongId(
          file.name,
          contextSongId,
          isMixedBatchWithYcr
        );
        const stemId = `custom:${targetSongId}:${file.name}`;
        const stem: LoadedOggStem = {
          id: stemId,
          name: file.name,
          durationSec: audioBuffer.duration,
          buffer: audioBuffer,
          role: this.classifyStemRole(file.name),
          targetSongId,
          isBuiltIn: false,
        };
        // Replace any existing custom stem with same ID or same role on that song
        const existingIdx = newlyLoaded.findIndex(
          (s) =>
            !s.isBuiltIn &&
            s.targetSongId === targetSongId &&
            (s.id === stemId ||
              (s.role === stem.role && stem.role !== 'alt'))
        );
        if (existingIdx >= 0) {
          newlyLoaded[existingIdx] = stem;
        } else {
          newlyLoaded.push(stem);
        }

        try {
          const db = await openStemsDb();
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put({
            id: stemId,
            name: file.name,
            targetSongId,
            arrayBuffer: rawBuf,
          });
        } catch {
          // ignore
        }
      } catch {
        // ignore invalid audio file
      }
    }

    this.allStems = newlyLoaded;
    return this.allStems;
  }

  public async loadEndlessOggFiles(files: FileList | File[]): Promise<LoadedOggStem[]> {
    return this.loadOggFilesForSong(files, 'endless');
  }

  public async clearEndlessOggStems(songId?: SongId): Promise<void> {
    this.stopSyncedStems();
    if (songId) {
      this.allStems = this.allStems.filter(
        (s) => s.isBuiltIn || s.targetSongId !== songId
      );
      try {
        const db = await openStemsDb();
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const allKeys: IDBValidKey[] = await new Promise((resolve) => {
          const req = store.getAllKeys();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
        for (const k of allKeys) {
          if (String(k).startsWith(`custom:${songId}:`)) {
            store.delete(k);
          }
        }
      } catch {
        // ignore
      }
      await this.preloadSongStems(songId);
    } else {
      this.allStems = this.allStems.filter((s) => s.isBuiltIn);
      try {
        const db = await openStemsDb();
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).clear();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Starts ALL loaded .ogg files for the given song simultaneously at 0.000s
   */
  public startSyncedStems(offsetSec = 0, songId: SongId = this.activeSongId) {
    const ctx = this.ensureContext();
    const stems = this.getStemsForSong(songId);
    if (!ctx || !this.masterGain || stems.length === 0) return;

    this.stopSyncedStems();
    this.activeSongId = songId;

    const syncStartAt = ctx.currentTime + 0.015;
    const clampedOffset = Math.max(0, offsetSec);

    this.activeSourceNodes = stems.map((stem) => {
      const source = ctx.createBufferSource();
      source.buffer = stem.buffer;

      const stemGain = ctx.createGain();
      stemGain.gain.setValueAtTime(0.9, syncStartAt);

      source.connect(stemGain);
      stemGain.connect(this.masterGain!);

      if (clampedOffset < stem.buffer.duration) {
        source.start(syncStartAt, clampedOffset);
      }

      return {
        source,
        gain: stemGain,
        role: stem.role,
      };
    });

    this.stemStartCtxTime = syncStartAt - clampedOffset;
    this.stemPausedOffsetSec = clampedOffset;
    this.stemsPlaying = true;
  }

  public pauseSyncedStems() {
    if (!this.stemsPlaying || !this.ctx) return;
    this.stemPausedOffsetSec = Math.max(
      0,
      this.ctx.currentTime - this.stemStartCtxTime
    );
    this.stopSyncedStems(false);
  }

  public resumeSyncedStems() {
    if (this.stemsPlaying) return;
    const stems = this.getStemsForSong(this.activeSongId);
    if (stems.length === 0) return;
    this.startSyncedStems(this.stemPausedOffsetSec, this.activeSongId);
  }

  public stopSyncedStems(resetOffset = true) {
    for (const item of this.activeSourceNodes) {
      try {
        item.source.stop();
        item.source.disconnect();
        item.gain.disconnect();
      } catch {
        // ignore already stopped
      }
    }
    this.activeSourceNodes = [];
    this.stemsPlaying = false;
    if (resetOffset) {
      this.stemPausedOffsetSec = 0;
    }
  }

  public isSyncedStemsPlaying(): boolean {
    return this.stemsPlaying;
  }

  public getSyncedStemsTimeMs(): number | null {
    if (!this.stemsPlaying || !this.ctx) return null;
    return (this.ctx.currentTime - this.stemStartCtxTime) * 1000;
  }

  // Mute BF vocal stem briefly on miss, restore on hit (classic FNF vocal stem behavior)
  public setPlayerVoiceStemMuted(muted: boolean) {
    if (!this.ctx || !this.stemsPlaying) return;
    const now = this.ctx.currentTime;
    for (const node of this.activeSourceNodes) {
      if (node.role === 'voices-bf') {
        node.gain.gain.setTargetAtTime(muted ? 0.0 : 0.9, now, 0.015);
      }
    }
  }

  // Play character vocal synth for either Boyfriend or any Sonic.exe opponent
  public playVocalNote(
    midi: number,
    isPlayer: boolean,
    character: OpponentCharacterId | PlayerCharacterId,
    durationMs = 180,
    special: NoteSpecialType = 'normal',
    volume = 0.75,
    songId?: SongId
  ) {
    // If real synchronized .ogg stems are playing for the active song, check which vocal stems are loaded
    if (songId && this.stemsPlaying) {
      const activeStems = this.getStemsForSong(songId);
      const hasCombinedVoices = activeStems.some(
        (s) => s.role === 'voices-combined'
      );
      const hasPlayerVoice =
        hasCombinedVoices || activeStems.some((s) => s.role === 'voices-bf');
      const hasOpponentVoice =
        hasCombinedVoices || activeStems.some((s) => s.role === 'voices-opp');

      if (isPlayer && hasPlayerVoice) {
        this.setPlayerVoiceStemMuted(false);
        return;
      }
      if (!isPlayer && hasOpponentVoice) {
        return;
      }
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    if (special === 'ring') {
      this.playRingCollect();
    }

    const now = ctx.currentTime;
    const durSec = Math.max(0.12, Math.min(1.65, durationMs / 1000));
    const freq = midiToFreq(midi);

    // Special dedicated Sega CD / MarStarBro "voices-majin.ogg" voice patch for Majin Sonic
    if (!isPlayer && (character === 'majin' || character === 'majin-og')) {
      const oscSaw = ctx.createOscillator();
      const oscPulse = ctx.createOscillator();
      const oscHarm = ctx.createOscillator();

      // Nasal FM Brass-Saxophone formant filters matching voices-majin.ogg
      const formant1 = ctx.createBiquadFilter();
      const formant2 = ctx.createBiquadFilter();
      const env = ctx.createGain();

      oscSaw.type = 'sawtooth';
      oscPulse.type = 'square';
      oscHarm.type = 'triangle';

      // Chromatic grace-note pitch scoop on note attack (characteristic of voices-majin.ogg)
      const scoopStartFreq = freq * 0.9438; // ~1 semitone below target
      oscSaw.frequency.setValueAtTime(scoopStartFreq, now);
      oscSaw.frequency.exponentialRampToValueAtTime(freq, now + 0.026);

      oscPulse.frequency.setValueAtTime(scoopStartFreq * 1.003, now);
      oscPulse.frequency.exponentialRampToValueAtTime(freq * 1.003, now + 0.026);

      oscHarm.frequency.setValueAtTime(freq * 2.0, now);

      // Expressive 6.5 Hz vibrato LFO on sustained notes (matching voices-majin.ogg vibrato tails)
      if (durSec >= 0.22) {
        const vibOsc = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vibOsc.type = 'sine';
        vibOsc.frequency.setValueAtTime(6.5, now);
        vibGain.gain.setValueAtTime(0.01, now);
        vibGain.gain.linearRampToValueAtTime(freq * 0.018, now + 0.08);
        vibOsc.connect(vibGain);
        vibGain.connect(oscSaw.frequency);
        vibGain.connect(oscPulse.frequency);
        vibOsc.start(now);
        vibOsc.stop(now + durSec + 0.03);
      }

      formant1.type = 'peaking';
      formant1.frequency.setValueAtTime(1420, now);
      formant1.Q.value = 3.6;
      formant1.gain.value = 9.5;

      formant2.type = 'lowpass';
      formant2.frequency.setValueAtTime(3450, now);
      formant2.Q.value = 2.4;

      const peakGain = Math.min(0.36, 0.28 * volume);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + 0.014);
      env.gain.setValueAtTime(peakGain * 0.88, now + Math.max(0.03, durSec - 0.04));
      env.gain.exponentialRampToValueAtTime(0.0001, now + durSec + 0.02);

      const harmGain = ctx.createGain();
      harmGain.gain.value = 0.35;

      oscSaw.connect(formant1);
      oscPulse.connect(formant1);
      oscHarm.connect(harmGain);
      harmGain.connect(formant1);

      formant1.connect(formant2);
      formant2.connect(env);
      env.connect(this.masterGain);

      oscSaw.start(now);
      oscPulse.start(now);
      oscHarm.start(now);
      oscSaw.stop(now + durSec + 0.03);
      oscPulse.stop(now + durSec + 0.03);
      oscHarm.stop(now + durSec + 0.03);
      return;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    if (isPlayer) {
      osc1.type = character === 'bf-pixel' ? 'square' : 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq * 0.97, now);
      osc2.frequency.setValueAtTime(freq * 1.004, now);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.025);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1320, now);
      filter.Q.value = 3.0;
    } else {
      if (character === 'xenophanes') {
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq * 0.5, now);
        osc2.frequency.setValueAtTime(freq * 1.01, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1650, now);
        filter.Q.value = 5.5;
      } else if (character === 'pixel-exe') {
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
      } else if (character === 'sonicexefake') {
        // Exclusive to Too Slow Encore (0..43.2s): hollow eerie disguised Sonic vowel voice from sonicexefake.ogg
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 1.002, now);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(920, now);
        filter.Q.value = 3.6;
      } else {
        // Classic Sonic.exe raspy guttural growl (Voices-sonicexe.ogg)
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

  public playBackingSubBeat(songId: SongId, subBeatIndex: number, volume = 0.7) {
    // If an instrumental .ogg stem is playing for this song, do not layer synthetic drums over it
    if (
      this.stemsPlaying &&
      this.getStemsForSong(songId).some(
        (s) => s.role === 'inst' || s.role === 'alt'
      )
    ) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || volume <= 0.01) return;

    const now = ctx.currentTime;
    const step = subBeatIndex % 8;

    // Ominous descending piano intro for Too Slow (0..28.4s = 128 sub-beats) & Too Slow Encore (0..14.2s = 64 sub-beats)
    const isTooSlowIntro =
      (songId === 'too-slow' && subBeatIndex < 128) ||
      (songId === 'too-slow-encore' && subBeatIndex < 64);

    if (isTooSlowIntro) {
      if (step === 0 || step === 4) {
        const chordProgression = [
          [52, 55, 59, 64], // Em
          [51, 55, 59, 63], // Eb+
          [50, 55, 59, 62], // G/D
          [49, 55, 58, 61], // C#dim
          [48, 52, 55, 60], // C
          [47, 50, 54, 59], // Bm
          [45, 48, 52, 57], // Am
          [44, 47, 52, 56], // E/G#
        ];
        const chordIdx = Math.floor(subBeatIndex / 8) % chordProgression.length;
        const chord = chordProgression[chordIdx];

        chord.forEach((midiNote) => {
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = 'triangle';
          pOsc.frequency.setValueAtTime(midiToFreq(midiNote), now);
          pGain.gain.setValueAtTime(0.08 * volume, now);
          pGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);
          pOsc.connect(pGain);
          pGain.connect(this.masterGain!);
          pOsc.start(now);
          pOsc.stop(now + 0.44);
        });

        // Shimmering bell overtone exclusively on Too Slow Encore (matching Inst-erect.ogg)
        if (songId === 'too-slow-encore') {
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(
            midiToFreq(chord[3] + 12),
            now
          );
          bellGain.gain.setValueAtTime(0.06 * volume, now);
          bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);
          bellOsc.connect(bellGain);
          bellGain.connect(this.masterGain!);
          bellOsc.start(now);
          bellOsc.stop(now + 0.56);
        }
      }
      return;
    }

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

    const rootMidi =
      songId === 'endless' || songId === 'endless-og'
        ? 45 // A2 bass root matching Endless .ogg
        : songId === 'triple-trouble'
          ? 39
          : songId.includes('you-cant-run')
            ? 36
            : 38;
    const progOffsets = [0, 0, 3, 3, 5, 5, 7, 5];
    const barNum = Math.floor(subBeatIndex / 8) % 4;
    const bassNote =
      rootMidi + progOffsets[step] + (barNum === 2 ? -4 : barNum === 3 ? -2 : 0);

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

  public playRingCollect() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = [987.77, 1318.51, 1567.98, 1975.53];
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
    this.setPlayerVoiceStemMuted(true);
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
