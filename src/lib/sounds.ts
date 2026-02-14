// Upgraded UI sound system (Duolingo-inspired feel)
// Plucky, layered, fast attack, minimal fatigue.

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let masterCompressor: DynamicsCompressorNode | null = null;

const getCtx = () => {
    if (!audioCtx) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
            audioCtx = new Ctx();

            // create compressor once
            masterCompressor = audioCtx.createDynamicsCompressor();
            masterCompressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
            masterCompressor.knee.setValueAtTime(30, audioCtx.currentTime);
            masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
            masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
            masterCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);

            masterCompressor.connect(audioCtx.destination);
        }
    }
    return audioCtx;
};

type SoundType = 'select' | 'success' | 'error' | 'complete';

export const soundManager = {
    init: (enabled: boolean) => {
        soundEnabled = enabled;
    },

    play: (type: SoundType) => {
        if (!soundEnabled) return;

        const ctx = getCtx();
        if (!ctx || !masterCompressor) return;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        switch (type) {
            case 'select':
                // short "tick"
                playLayeredNote(ctx, {
                    freq: 880,
                    type: 'triangle',
                    start: now,
                    duration: 0.045,
                    volume: 0.14,
                    slide: true
                });
                break;

            case 'success':
                // fast reward interval (perfect fifth)
                playLayeredNote(ctx, {
                    freq: 659.25,
                    type: 'triangle',
                    start: now,
                    duration: 0.09,
                    volume: 0.18
                });

                playLayeredNote(ctx, {
                    freq: 987.77,
                    type: 'triangle',
                    start: now + 0.08,
                    duration: 0.16,
                    volume: 0.18
                });
                break;

            case 'error':
                // soft but noticeable downward cue
                playLayeredNote(ctx, {
                    freq: 440,
                    type: 'sawtooth',
                    start: now,
                    duration: 0.08,
                    volume: 0.11,
                    slideDown: true
                });

                playLayeredNote(ctx, {
                    freq: 370,
                    type: 'sawtooth',
                    start: now + 0.07,
                    duration: 0.18,
                    volume: 0.11,
                    slideDown: true
                });
                break;

            case 'complete':
                // major chord = victory emotion
                playLayeredNote(ctx, {
                    freq: 523.25,
                    type: 'triangle',
                    start: now,
                    duration: 0.28,
                    volume: 0.16
                });

                playLayeredNote(ctx, {
                    freq: 659.25,
                    type: 'triangle',
                    start: now,
                    duration: 0.28,
                    volume: 0.14
                });

                playLayeredNote(ctx, {
                    freq: 783.99,
                    type: 'triangle',
                    start: now,
                    duration: 0.35,
                    volume: 0.14
                });
                break;
        }
    }
};

interface NoteOptions {
    freq: number;
    type: OscillatorType;
    start: number;
    duration: number;
    volume: number;
    slide?: boolean;
    slideDown?: boolean;
}

function createPluckGain(
    ctx: AudioContext,
    start: number,
    volume: number,
    duration: number
) {
    const gain = ctx.createGain();

    // fast attack, natural decay
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    return gain;
}

function playLayeredNote(
    ctx: AudioContext,
    { freq, type, start, duration, volume, slide, slideDown }: NoteOptions
) {
    if (!masterCompressor) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = type;
    osc2.type = type;

    // slight detune = richer sound
    osc1.frequency.setValueAtTime(freq, start);
    osc2.frequency.setValueAtTime(freq * 1.01, start);

    if (slide) {
        osc1.frequency.exponentialRampToValueAtTime(freq * 0.85, start + duration);
        osc2.frequency.exponentialRampToValueAtTime(freq * 0.86, start + duration);
    }

    if (slideDown) {
        osc1.frequency.exponentialRampToValueAtTime(freq * 0.75, start + duration);
        osc2.frequency.exponentialRampToValueAtTime(freq * 0.76, start + duration);
    }

    const gain = createPluckGain(ctx, start, volume, duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterCompressor);

    osc1.start(start);
    osc2.start(start);

    osc1.stop(start + duration);
    osc2.stop(start + duration);
}
