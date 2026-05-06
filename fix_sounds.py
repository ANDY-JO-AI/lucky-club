with open('src/lib/sounds.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# startDrumroll 함수 찾아서 그 앞에 TIP 긴장 BGM 함수 삽입
tip_bgm = '''
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

'''

# startDrumroll 앞에 삽입
old = 'export function startDrumroll'
new = tip_bgm + 'export function startDrumroll'
if old in c:
    c = c.replace(old, new, 1)
    with open('src/lib/sounds.ts', 'w', encoding='utf-8') as f:
        f.write(c)
    print('SUCCESS')
else:
    print('MATCH_FAILED')
