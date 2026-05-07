with open("src/lib/casino.ts", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

# 49-66번 줄 (0-indexed: 48-65) 을 새 코드로 교체
new_lines = """// ── Fisher-Yates shuffle
export function shuffleReel<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Anti-Pattern: 3연속 동일 티어 차단
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

// ── Pity System: 4연속 저액 → 5번째 고액 보정
function applyPity(tip: TipResult, consecutiveLow: number): TipResult {
  if (consecutiveLow < 4) return tip
  const tier = getTier(tip)
  if (tier === 'high' || tier === 'jackpot') return tip
  const vals = ['w50k','w100k','w150k','w200k'] as TipResult[]
  const weights: Record<string,number> = { w50k:50, w100k:30, w150k:15, w200k:5 }
  return weightedRandom<TipResult>(weights as Record<TipResult,number>)
}

// ── 스핀 히스토리 (모듈 레벨)
let _spinHistory: TipResult[] = []

// ── 셔플된 릴 순서 (매 스핀 갱신)
export let shuffledTipReel:   TipResult[]   = [...TIP_REEL_ORDER]
export let shuffledDrinkReel: DrinkResult[] = [...DRINK_REEL_ORDER]

// Main spin function
export function spinSlots(
  config: ClubConfig,
  consecutiveLow: number
): { tip: TipResult; drink: DrinkResult } {
  // MECHANIC 1: Virtual Reel Shuffle
  shuffledTipReel   = shuffleReel(TIP_REEL_ORDER)
  shuffledDrinkReel = shuffleReel(DRINK_REEL_ORDER)

  // MECHANIC 2: Weighted random
  let tip = weightedRandom<TipResult>(config.tipWeights)

  // MECHANIC 3: Anti-Pattern
  tip = antiPattern(tip, _spinHistory, config.tipWeights)

  // MECHANIC 4: Pity System
  tip = applyPity(tip, consecutiveLow)

  // 히스토리 업데이트
  _spinHistory = [..._spinHistory.slice(-3), tip]

  // MECHANIC 5: Jackpot forced shot
  let drink: DrinkResult
  if (tip === 'jackpot' && config.jackpotForcedShot) {
    drink = 'p100'
  } else {
    drink = weightedRandom<DrinkResult>(config.drinkWeights)
  }

  return { tip, drink }
}

""".splitlines(keepends=True)

# 48~65 번째 줄 (0-indexed) 교체
result = lines[:48] + new_lines + lines[66:]

with open("src/lib/casino.ts", "w", encoding="utf-8") as f:
    f.writelines(result)
print("SUCCESS")
