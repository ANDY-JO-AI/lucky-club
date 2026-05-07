with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) tipToSymbol 매핑 수정 (5천동 = SMALL)
old_sym = """function tipToSymbol(key: string): string {
  if (key === 'nothing')  return '💀'
  if (key === 'jackpot')  return '🎉 JACKPOT'
  if (key === 'w200k')    return '🎰 MEGA'
  if (key === 'w100k')    return '🎰 MEGA'
  if (key === 'w50k')     return '🎰 BIG'
  if (key === 'w20k')     return '🎰 BIG'
  if (key === 'w10k')     return '🎰 MID'
  if (key === 'w5k')      return '🎰 MID'
  if (key === 'w2k')      return '🎰 SMALL'
  if (key === 'w1k')      return '🎰 SMALL'
  return '🎰'
}"""
new_sym = """function tipToSymbol(key: string): string {
  if (key === 'nothing')  return '💀'
  if (key === 'jackpot')  return '🎉 JACKPOT'
  if (key === 'w200k')    return '🎰 MEGA'
  if (key === 'w100k')    return '🎰 MEGA'
  if (key === 'w50k')     return '🎰 BIG'
  if (key === 'w20k')     return '🎰 MID'
  if (key === 'w10k')     return '🎰 SMALL'
  if (key === 'w5k')      return '🎰 SMALL'
  if (key === 'w2k')      return '🎰 SMALL'
  if (key === 'w1k')      return '🎰 SMALL'
  return '🎰'
}"""
c = c.replace(old_sym, new_sym, 1)

# 2) 랜덤 심볼 풀 상수 추가 (colorOf 앞에)
old_colorof = "function colorOf(type: 'tip' | 'drink', key: string): string {"
new_colorof = """// 랜덤 회전용 심볼 풀 — 순서 예측 완전 차단
const TIP_SYMBOL_POOL = [
  '💀','🎰 SMALL','🎰 SMALL','🎰 MID','🎰 MID',
  '🎰 BIG','🎰 BIG','🎰 MEGA','🎉 JACKPOT',
]
const DRINK_SYMBOL_POOL = ['🥤','🍺','🍺','🔥','🔥','💥']

function randomSymbol(type: 'tip' | 'drink'): string {
  const pool = type === 'tip' ? TIP_SYMBOL_POOL : DRINK_SYMBOL_POOL
  return pool[Math.floor(Math.random() * pool.length)]
}

function colorOf(type: 'tip' | 'drink', key: string): string {"""
c = c.replace(old_colorof, new_colorof, 1)

# 3) window_ state를 string[] 에서 랜덤 심볼 초기값으로 변경
old_winstate = "  const [window_,  setWindow]   = useState<string[]>(() => buildWindow(order, 0))"
new_winstate = """  const [window_,  setWindow]   = useState<string[]>(() =>
    Array.from({ length: VISIBLE }, () => randomSymbol(type))
  )"""
c = c.replace(old_winstate, new_winstate, 1)

# 4) tick 함수 — 순서대로 이동 대신 완전 랜덤 심볼로 교체
old_tick = """  const tick = useCallback(() => {
    topRef.current = (topRef.current + 1) % order.length
    setWindow(buildWindow(order, topRef.current))
  }, [order])"""
new_tick = """  const tick = useCallback(() => {
    // 고속 회전 중: 완전 랜덤 심볼 표시 — 순서 예측 불가
    setWindow(prev => {
      const next = [...prev.slice(1), randomSymbol(type)]
      return next
    })
  }, [type])"""
c = c.replace(old_tick, new_tick, 1)

# 5) snapTo 함수 — 감속 중 심볼 표시 (실제 키 대신 심볼로)
old_snap = """  const snapTo = useCallback((targetIdx: number) => {
    topRef.current = topForCenter(order, targetIdx)
    setWindow(buildWindow(order, topRef.current))
  }, [order])"""
new_snap = """  const snapTo = useCallback((targetIdx: number) => {
    topRef.current = topForCenter(order, targetIdx)
    // 감속 중 앞뒤 칸도 랜덤 심볼 유지 — 중앙만 실제 심볼
    const centerKey = order[targetIdx % order.length]
    setWindow(prev =>
      prev.map((_, i) =>
        i === CENTER ? centerKey : randomSymbol(type)
      )
    )
  }, [order, type])"""
c = c.replace(old_snap, new_snap, 1)

# 6) 마지막 2칸 흐림 효과 — decelStep 상태 추가
old_revealed = "  const [revealed, setRevealed] = useState(false)"
new_revealed = """  const [revealed,   setRevealed]   = useState(false)
  const [decelStep,  setDecelStep]  = useState(0)   // 감속 단계 (마지막 2칸 흐림용)"""
c = c.replace(old_revealed, new_revealed, 1)

# 7) startDecel 내부 step 증가 시 setDecelStep 호출
old_runnext = "      step++\n      timerRef.current = setTimeout(runNext, s.delay)"
new_runnext = """      setDecelStep(step)
      step++
      timerRef.current = setTimeout(runNext, s.delay)"""
c = c.replace(old_runnext, new_runnext, 1)

# 8) idle 시 decelStep 리셋
old_idle = "      setTeasePulse(false)\n      topRef.current = 0\n      setWindow(buildWindow(order, 0))"
new_idle = """      setTeasePulse(false)
      setDecelStep(0)
      topRef.current = 0
      setWindow(Array.from({ length: VISIBLE }, () => randomSymbol(type)))"""
c = c.replace(old_idle, new_idle, 1)

# 9) spin 시 decelStep 리셋
old_spin_cmd = "      setRevealed(false)\n      setGlowing(false)\n      setTeasePulse(false)\n      intervalRef.current = setInterval(tick, FAST_MS)"
new_spin_cmd = """      setRevealed(false)
      setGlowing(false)
      setTeasePulse(false)
      setDecelStep(0)
      intervalRef.current = setInterval(tick, FAST_MS)"""
c = c.replace(old_spin_cmd, new_spin_cmd, 1)

# 10) 중앙 칸 opacity — 마지막 2칸에서 흐리게 (긴장감 극대화)
old_opacity = """            const isSpinning = !revealed
            const opacity  = isCenter ? 1 : isSpinning ? 0 : Math.max(0.55, 1 - dist * 0.15)"""
new_opacity = """            const isSpinning  = !revealed
            const isTipType  = type === 'tip'
            const stepsLeft  = TIP_DECEL_STEPS.length - decelStep
            const isDimmed   = isTipType && !revealed && stepsLeft <= 2 && isCenter
            const opacity    = isCenter
              ? (isDimmed ? 0.25 : 1)
              : isSpinning ? 0 : Math.max(0.55, 1 - dist * 0.15)"""
c = c.replace(old_opacity, new_opacity, 1)

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
