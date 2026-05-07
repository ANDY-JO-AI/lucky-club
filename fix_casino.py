with open("src/lib/casino.ts", "r", encoding="utf-8") as f:
    c = f.read()

old_spin = """// Main spin function ??returns tip + drink results
export function spinSlots(
  config: ClubConfig,
  consecutiveLow: number
): { tip: TipResult; drink: DrinkResult } {
  // ADDICTION MECHANIC 2: Variable reward with weighted random
  const tip = weightedRandom<TipResult>(config.tipWeights)
  
  // ADDICTION MECHANIC: Jackpot forces ?먯꺑
  let drink: DrinkResult
  if (tip === 'jackpot' && config.jackpotForcedShot) {
    drink = 'p100'
  } else {
    drink = weightedRandom<DrinkResult>(config.drinkWeights)
  }

  return { tip, drink }
}"""

new_spin = """// ── Fisher-Yates shuffle ─────────────────────────────────────
export function shuffleReel<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Anti-Pattern: 3연속 동일 티어 차단 ───────────────────────
function getTier(tip: TipResult): string {
  if (tip === 'nothing') return 'curse'
  const val = parseInt(tip.replace(/[^0-9]/g, ''), 10)
  if (val <= 5000)  return 'low'
  if (val <= 20000) return 'mid'
  if (val <= 50000) return 'high'
  return 'jackpot'
}

function antiPattern(
  tip: TipResult,
  history: TipResult[],
  weights: Record<TipResult, number>
): TipResult {
  if (history.length < 2) return tip
  const t0 = getTier(history[history.length - 1])
  const t1 = getTier(history[history.length - 2])
  if (getTier(tip) === t0 && t0 === t1) {
    for (let i = 0; i < 8; i++) {
      const retry = weightedRandom<TipResult>(weights)
      if (getTier(retry) !== t0) return retry
    }
  }
  return tip
}

// ── Pity System: 4연속 저액 → 5번째 고액 보정 ─────────────────
function applyPity(tip: TipResult, consecutiveLow: number): TipResult {
  if (consecutiveLow < 4) return tip
  const tier = getTier(tip)
  if (tier === 'high' || tier === 'jackpot') return tip
  // 고액 강제 보정
  const highPool: Partial<Record<TipResult, number>> = {
    w50k: 50, w100k: 30, w150k: 15, w200k: 5,
  }
  return weightedRandom<TipResult>(highPool as Record<TipResult, number>)
}

// ── 스핀 히스토리 (모듈 레벨 상태) ───────────────────────────
let _spinHistory: TipResult[] = []

// ── 셔플된 릴 순서 (매 스핀 갱신) ────────────────────────────
export let shuffledTipReel:   TipResult[]   = [...TIP_REEL_ORDER]
export let shuffledDrinkReel: DrinkResult[] = [...DRINK_REEL_ORDER]

// Main spin function — returns tip + drink results
export function spinSlots(
  config: ClubConfig,
  consecutiveLow: number
): { tip: TipResult; drink: DrinkResult } {
  // MECHANIC 1: Virtual Reel Shuffle — 매 스핀 릴 순서 무작위화
  shuffledTipReel   = shuffleReel(TIP_REEL_ORDER)
  shuffledDrinkReel = shuffleReel(DRINK_REEL_ORDER)

  // MECHANIC 2: Variable reward with weighted random
  let tip = weightedRandom<TipResult>(config.tipWeights)

  // MECHANIC 3: Anti-Pattern — 3연속 동일 구간 차단
  tip = antiPattern(tip, _spinHistory, config.tipWeights)

  // MECHANIC 4: Pity System — 4연속 저액 → 고액 보정
  tip = applyPity(tip, consecutiveLow)

  // 히스토리 업데이트 (최근 4개만 유지)
  _spinHistory = [..._spinHistory.slice(-3), tip]

  // MECHANIC 5: Jackpot forced shot
  let drink: DrinkResult
  if (tip === 'jackpot' && config.jackpotForcedShot) {
    drink = 'p100'
  } else {
    drink = weightedRandom<DrinkResult>(config.drinkWeights)
  }

  return { tip, drink }
}"""

if old_spin in c:
    c = c.replace(old_spin, new_spin, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/lib/casino.ts", "w", encoding="utf-8") as f:
    f.write(c)
