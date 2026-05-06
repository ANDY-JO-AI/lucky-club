// Casino probability engine with all 7 addiction mechanics
import {
  TipResult, DrinkResult, TipWeights, DrinkWeights,
  TIP_REEL_ORDER, DRINK_REEL_ORDER, isHighValue, isLowValue, ClubConfig
} from '../types/game'

// Seeded weighted random
export function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const seed = Date.now() + Math.random() * 999999
  const rng = mulberry32(seed)
  const entries = Object.entries(weights) as [T, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let rand = rng() * total
  for (const [key, weight] of entries) {
    rand -= weight
    if (rand <= 0) return key
  }
  return entries[entries.length - 1][0]
}

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ADDICTION MECHANIC 1: Near-miss engine
// Returns the adjacent cell index (1 step before actual result)
export function getNearMissIndex(actualIndex: number, reelLength: number): number {
  return (actualIndex - 1 + reelLength) % reelLength
}

// Get tip near-miss result (1 step before jackpot if near jackpot)
export function getTipNearMiss(actual: TipResult): TipResult {
  const idx = TIP_REEL_ORDER.indexOf(actual)
  const nearIdx = (idx - 1 + TIP_REEL_ORDER.length) % TIP_REEL_ORDER.length
  return TIP_REEL_ORDER[nearIdx]
}

export function getDrinkNearMiss(actual: DrinkResult): DrinkResult {
  const idx = DRINK_REEL_ORDER.indexOf(actual)
  const nearIdx = (idx - 1 + DRINK_REEL_ORDER.length) % DRINK_REEL_ORDER.length
  return DRINK_REEL_ORDER[nearIdx]
}

// Main spin function — returns tip + drink results
export function spinSlots(
  config: ClubConfig,
  consecutiveLow: number
): { tip: TipResult; drink: DrinkResult } {
  // ADDICTION MECHANIC 2: Variable reward with weighted random
  const tip = weightedRandom<TipResult>(config.tipWeights)
  
  // ADDICTION MECHANIC: Jackpot forces 원샷
  let drink: DrinkResult
  if (tip === 'jackpot' && config.jackpotForcedShot) {
    drink = 'p100'
  } else {
    drink = weightedRandom<DrinkResult>(config.drinkWeights)
  }

  return { tip, drink }
}

// ADDICTION MECHANIC 3: Streak counter update
export function updateStreaks(
  tip: TipResult,
  consecutiveLow: number,
  consecutiveHigh: number
): { newLow: number; newHigh: number } {
  if (isHighValue(tip)) {
    return { newLow: 0, newHigh: consecutiveHigh + 1 }
  } else if (isLowValue(tip)) {
    return { newLow: consecutiveLow + 1, newHigh: 0 }
  }
  return { newLow: consecutiveLow, newHigh: 0 }
}

// ADDICTION MECHANIC 4: Escalating tension — drumroll BPM + volume
export function getEscalationParams(
  spinsWithoutJackpot: number,
  baseBPM: number = 80,
  baseVolume: number = 0.7
): { bpm: number; volume: number } {
  const bpmBoost = Math.min(spinsWithoutJackpot * 2, 40)
  const volBoost = Math.min(spinsWithoutJackpot * 0.01, 0.2)
  return {
    bpm: baseBPM + bpmBoost,
    volume: Math.min(baseVolume + volBoost, 1.0)
  }
}

// ADDICTION MECHANIC 5: Celebration delay
export function getCelebrationDelay(tip: TipResult): number {
  if (tip === 'jackpot') return 800
  if (tip === 'w200k') return 600
  return 0
}

// Calculate compass target sector based on player count
export function getCompassTarget(playerCount: number): number {
  return Math.floor(Math.random() * playerCount)
}

// Get direction label for compass target
export function getDirectionLabel(
  targetIndex: number,
  playerCount: number,
  lang: 'ko' | 'en' | 'vi' = 'ko'
): string {
  const labels: Record<string, Record<string, string[]>> = {
    ko: {
      '2': ['맞은편'],
      '3': ['왼쪽', '맞은편', '오른쪽'],
    },
    en: {
      '2': ['Opposite'],
      '3': ['Left', 'Opposite', 'Right'],
    },
    vi: {
      '2': ['Đối diện'],
      '3': ['Trái', 'Đối diện', 'Phải'],
    }
  }

  if (playerCount === 2) {
    return labels[lang]['2'][0] || 'Opposite'
  }
  if (playerCount === 3) {
    return labels[lang]['3'][targetIndex % 3]
  }

  // 4-6 players
  const koLabels4to6 = [
    '왼쪽 2번째', '왼쪽 1번째', '맞은편', '오른쪽 1번째', '오른쪽 2번째',
    '오른쪽 3번째'
  ]
  const enLabels4to6 = [
    'Left 2nd', 'Left 1st', 'Opposite', 'Right 1st', 'Right 2nd', 'Right 3rd'
  ]
  const viLabels4to6 = [
    'Trái 2', 'Trái 1', 'Đối diện', 'Phải 1', 'Phải 2', 'Phải 3'
  ]

  if (playerCount <= 6) {
    const arr = lang === 'ko' ? koLabels4to6 : lang === 'en' ? enLabels4to6 : viLabels4to6
    return arr[targetIndex % arr.length]
  }

  // 7-20 players: numbered positions
  const pos = targetIndex + 1
  if (lang === 'ko') return `${pos}번 자리`
  if (lang === 'en') return `Seat ${pos}`
  return `Ghế ${pos}`
}

// Mission probability check (15% chance)
export function shouldTriggerMission(): boolean {
  return Math.random() < 0.15
}

// Get mission based on spin round
export function getMissionLevel(spinCount: number): 1 | 2 | 3 {
  if (spinCount <= 5) return 1
  if (spinCount <= 10) return 2
  return 3
}
