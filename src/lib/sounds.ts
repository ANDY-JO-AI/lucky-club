// Sound manager using Howler.js
import { Howl, Howler } from 'howler'

// All sound instances
const sounds: Record<string, Howl> = {}

// Sound definitions — using Web Audio API synthesis as fallback when files missing
const soundDefs: Record<string, { src: string[]; loop?: boolean; volume?: number }> = {
  drumroll:       { src: ['/sounds/drumroll.mp3'],       loop: true,  volume: 0.7 },
  slot_spin:      { src: ['/sounds/slot_spin.mp3'],      loop: true,  volume: 0.8 },
  slot_stop:      { src: ['/sounds/slot_stop.mp3'],      loop: false, volume: 1.0 },
  coin_single:    { src: ['/sounds/coin_single.mp3'],    loop: false, volume: 0.8 },
  coin_cascade:   { src: ['/sounds/coin_cascade.mp3'],   loop: false, volume: 0.8 },
  fanfare_short:  { src: ['/sounds/fanfare_short.mp3'],  loop: false, volume: 0.9 },
  fanfare_long:   { src: ['/sounds/fanfare_long.mp3'],   loop: false, volume: 1.0 },
  jackpot_777:    { src: ['/sounds/jackpot_777.mp3'],    loop: false, volume: 1.0 },
  sad_trombone:   { src: ['/sounds/sad_trombone.mp3'],   loop: false, volume: 0.9 },
  siren:          { src: ['/sounds/siren.mp3'],           loop: false, volume: 0.9 },
  compass_spin:   { src: ['/sounds/compass_spin.mp3'],   loop: false, volume: 0.8 },
  compass_stop:   { src: ['/sounds/compass_stop.mp3'],   loop: false, volume: 1.0 },
  warning_beep:   { src: ['/sounds/warning_beep.mp3'],   loop: false, volume: 0.9 },
  respin:         { src: ['/sounds/respin.mp3'],          loop: false, volume: 0.9 },
}

let masterVolume = 0.8
let isMuted = false

export function initSounds() {
  Object.entries(soundDefs).forEach(([key, def]) => {
    sounds[key] = new Howl({
      src: def.src,
      loop: def.loop || false,
      volume: def.volume || 1.0,
      html5: false,
      onloaderror: () => {
        // Silently fail — synthesized sounds will be used as fallback
        console.warn(`Sound ${key} not found, using synthesis`)
      }
    })
  })
}

// Web Audio API synthesis fallback for missing sounds
const audioCtx: AudioContext | null = typeof AudioContext !== 'undefined'
  ? new AudioContext()
  : null

function synthesize(type: 'click' | 'coin' | 'fanfare' | 'jackpot' | 'sad' | 'beep' | 'whoosh') {
  if (!audioCtx || isMuted) return
  const now = audioCtx.currentTime

  switch (type) {
    case 'click': {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain); gain.connect(audioCtx.destination)
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)
      gain.gain.setValueAtTime(0.3 * masterVolume, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
      osc.start(now); osc.stop(now + 0.1)
      break
    }
    case 'coin': {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain); gain.connect(audioCtx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3)
      gain.gain.setValueAtTime(0.4 * masterVolume, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now); osc.stop(now + 0.3)
      break
    }
    case 'fanfare': {
      const freqs = [523, 659, 784, 1047]
      freqs.forEach((freq, i) => {
        const osc = audioCtx!.createOscillator()
        const gain = audioCtx!.createGain()
        osc.connect(gain); gain.connect(audioCtx!.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        const t = now + i * 0.12
        gain.gain.setValueAtTime(0.2 * masterVolume, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        osc.start(t); osc.stop(t + 0.25)
      })
      break
    }
    case 'jackpot': {
      const freqs = [523, 659, 784, 1047, 1319, 1568]
      freqs.forEach((freq, i) => {
        const osc = audioCtx!.createOscillator()
        const gain = audioCtx!.createGain()
        osc.connect(gain); gain.connect(audioCtx!.destination)
        osc.type = 'sawtooth'
        osc.frequency.value = freq
        const t = now + i * 0.08
        gain.gain.setValueAtTime(0.15 * masterVolume, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.start(t); osc.stop(t + 0.4)
      })
      break
    }
    case 'sad': {
      const freqs = [494, 440, 392, 349]
      freqs.forEach((freq, i) => {
        const osc = audioCtx!.createOscillator()
        const gain = audioCtx!.createGain()
        osc.connect(gain); gain.connect(audioCtx!.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = now + i * 0.2
        gain.gain.setValueAtTime(0.3 * masterVolume, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        osc.start(t); osc.stop(t + 0.3)
      })
      break
    }
    case 'beep': {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain); gain.connect(audioCtx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3 * masterVolume, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.start(now); osc.stop(now + 0.2)
      break
    }
    case 'whoosh': {
      const bufferSize = audioCtx.sampleRate * 0.5
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      const source = audioCtx.createBufferSource()
      const gainNode = audioCtx.createGain()
      const filter = audioCtx.createBiquadFilter()
      source.buffer = buffer
      filter.type = 'bandpass'
      filter.frequency.value = 1000
      source.connect(filter); filter.connect(gainNode); gainNode.connect(audioCtx.destination)
      gainNode.gain.setValueAtTime(0.3 * masterVolume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      source.start(now)
      break
    }
  }
}

// Drumroll using synthesis with adjustable BPM
let drumrollInterval: ReturnType<typeof setInterval> | null = null
let drumrollBPM = 80


// ── TIP 구간 전용 긴장 BGM (Web Audio API 합성) ──────────────────────────────
let tipTensionInterval: ReturnType<typeof setInterval> | null = null
let tipTensionCtx: AudioContext | null = null

export function startTipTension() {
  if (isMuted) return
  stopTipTension()
  try {
    tipTensionCtx = new AudioContext()
    const ctx = tipTensionCtx
    let beat = 0
    // 빠른 스트링 + 타악기 조합으로 심장 두근거리는 긴장음 생성
    const playBeat = () => {
      if (!ctx || isMuted) return
      const now = ctx.currentTime
      const bpm = Math.min(160 + beat * 2, 220) // 점점 빨라짐
      beat++

      // 타악기 히트
      const bufSize = ctx.sampleRate * 0.08
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const percGain = ctx.createGain()
      percGain.gain.setValueAtTime(0.35 * masterVolume, now)
      src.connect(percGain)
      percGain.connect(ctx.destination)
      src.start(now)

      // 고음 현악기 긴장음 (상승 글리산도)
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220 + beat * 8, now)
      osc.frequency.exponentialRampToValueAtTime(440 + beat * 12, now + 0.15)
      oscGain.gain.setValueAtTime(0.12 * masterVolume, now)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.connect(oscGain)
      oscGain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.15)
    }

    playBeat()
    const intervalMs = 60000 / 140 // 140 BPM 시작
    tipTensionInterval = setInterval(playBeat, intervalMs)
  } catch { /* AudioContext not available */ }
}

export function stopTipTension() {
  if (tipTensionInterval) {
    clearInterval(tipTensionInterval)
    tipTensionInterval = null
  }
  if (tipTensionCtx) {
    try { tipTensionCtx.close() } catch { /* ignore */ }
    tipTensionCtx = null
  }
}

export function startDrumroll(bpm: number = 80, vol: number = 0.7) {
  if (isMuted) return
  drumrollBPM = bpm
  stopDrumroll()

  // Try Howl first
  if (sounds.drumroll && sounds.drumroll.state() === 'loaded') {
    const rate = bpm / 80
    sounds.drumroll.rate(Math.min(rate, 2.0))
    sounds.drumroll.volume(vol * masterVolume)
    sounds.drumroll.play()
    return
  }

  // Synthesis fallback
  const intervalMs = (60 / bpm) * 1000 * 0.25
  drumrollInterval = setInterval(() => {
    if (audioCtx && !isMuted) synthesize('click')
  }, intervalMs)
}

export function stopDrumroll() {
  if (sounds.drumroll) sounds.drumroll.stop()
  if (drumrollInterval) { clearInterval(drumrollInterval); drumrollInterval = null }
}

export function playSound(name: string) {
  if (isMuted) return

  // Resume AudioContext if suspended (browser autoplay policy)
  if (audioCtx?.state === 'suspended') audioCtx.resume()

  const howl = sounds[name]
  if (howl && howl.state() === 'loaded') {
    howl.volume(masterVolume)
    howl.play()
    return
  }

  // Synthesis fallback
  switch (name) {
    case 'slot_stop':    synthesize('click'); break
    case 'coin_single':  synthesize('coin');  break
    case 'coin_cascade': synthesize('coin');  break
    case 'fanfare_short':synthesize('fanfare'); break
    case 'fanfare_long': synthesize('fanfare'); break
    case 'jackpot_777':  synthesize('jackpot'); break
    case 'sad_trombone': synthesize('sad');   break
    case 'siren':        synthesize('beep');  break
    case 'compass_spin': synthesize('whoosh'); break
    case 'compass_stop': synthesize('click'); break
    case 'warning_beep': synthesize('beep');  break
    case 'respin':       synthesize('fanfare'); break
  }
}

export function setMasterVolume(vol: number) {
  masterVolume = vol
  Howler.volume(vol)
}

export function setMuted(muted: boolean) {
  isMuted = muted
  Howler.mute(muted)
}

// Haptic feedback
export function haptic(type: 'light' | 'medium' | 'strong' | 'continuous', duration?: number) {
  if (!navigator.vibrate) return
  switch (type) {
    case 'light':      navigator.vibrate(30); break
    case 'medium':     navigator.vibrate(100); break
    case 'strong':     navigator.vibrate(300); break
    case 'continuous': navigator.vibrate(duration || 500); break
  }
}

// Torch API strobe
export async function torchStrobe(times: number = 5) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    const track = stream.getVideoTracks()[0]
    if (!track) return
    const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
    if (!capabilities.torch) { stream.getTracks().forEach(t => t.stop()); return }
    for (let i = 0; i < times; i++) {
      await (track as MediaStreamTrack & { applyConstraints: (c: object) => Promise<void> })
        .applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] })
      await new Promise(r => setTimeout(r, 100))
      await (track as MediaStreamTrack & { applyConstraints: (c: object) => Promise<void> })
        .applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] })
      await new Promise(r => setTimeout(r, 100))
    }
    stream.getTracks().forEach(t => t.stop())
  } catch { /* torch not available */ }
}
