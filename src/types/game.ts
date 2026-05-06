// Game types and interfaces
export type Category = 'beer' | 'karaoke' | 'adult'
export type Language = 'ko' | 'en' | 'vi'

export type TipResult =
  | 'nothing'
  | 'w1k'
  | 'w2k'
  | 'w5k'
  | 'w10k'
  | 'w20k'
  | 'w50k'
  | 'w100k'
  | 'w200k'
  | 'jackpot'

export type DrinkResult = 'p25' | 'p50' | 'p70' | 'p100' | 'respin'

export type TipTier = 'curse' | 'low' | 'mid' | 'mid-high' | 'high' | 'jackpot' | 'nothing'
export type DrinkTier = 'light' | 'medium' | 'heavy' | 'shot' | 'respin'

export interface TipWeights {
  nothing: number
  w1k: number
  w2k: number
  w5k: number
  w10k: number
  w20k: number
  w50k: number
  w100k: number
  w200k: number
  jackpot: number
}

export interface DrinkWeights {
  p25: number
  p50: number
  p70: number
  p100: number
  respin: number
}

export interface Mission {
  id: string
  text_ko: string
  text_en: string
  text_vi: string
  active: boolean
}

export interface MissionSet {
  level1: Mission[]
  level2: Mission[]
  level3: Mission[]
}

export interface ClubConfig {
  tipWeights: TipWeights
  drinkWeights: DrinkWeights
  adultPIN: string
  jackpotForcedShot: boolean
  forcedShot: Record<TipResult, boolean>
  reSpinEnabled: boolean
  curseTierEnabled: boolean
  escalationEnabled: boolean
  nearMissEnabled: boolean
  autoBillboard: boolean
  missionLevelEnabled: { 1: boolean; 2: boolean; 3: boolean }
}

export interface SpinResult {
  tip: TipResult
  drink: DrinkResult
  mission?: Mission | null
  timestamp: number
}

export interface GameState {
  category: Category
  playerCount: number
  spinCount: number
  consecutiveLow: number
  consecutiveHigh: number
  jackpotCount: number
  lastResults: SpinResult[]
  isSpinning: boolean
  currentResult: SpinResult | null
  showBillboard: boolean
  escalationLevel: number
  isMuted: boolean
  volume: number
  compassTarget: number | null
  showCompass: boolean
  showMission: boolean
  currentMission: Mission | null
  totalTipToday: number
}

export const DEFAULT_TIP_WEIGHTS: TipWeights = {
  nothing: 5,
  w1k: 3,
  w2k: 3,
  w5k: 4,
  w10k: 10,
  w20k: 13,
  w50k: 22,
  w100k: 20,
  w200k: 13,
  jackpot: 7,
}

export const DEFAULT_DRINK_WEIGHTS: DrinkWeights = {
  p25: 35,
  p50: 30,
  p70: 20,
  p100: 12,
  respin: 3,
}

export const DEFAULT_CONFIG: ClubConfig = {
  tipWeights: DEFAULT_TIP_WEIGHTS,
  drinkWeights: DEFAULT_DRINK_WEIGHTS,
  adultPIN: '1234',
  jackpotForcedShot: true,
  forcedShot: {
    nothing: false,
    w1k: false,
    w2k: false,
    w5k: false,
    w10k: false,
    w20k: false,
    w50k: false,
    w100k: false,
    w200k: false,
    jackpot: true,
  },
  reSpinEnabled: true,
  curseTierEnabled: true,
  escalationEnabled: true,
  nearMissEnabled: true,
  autoBillboard: true,
  missionLevelEnabled: { 1: true, 2: true, 3: true },
}

export const TIP_VALUES: Record<TipResult, number> = {
  nothing: 0,
  w1k: 1000,
  w2k: 2000,
  w5k: 5000,
  w10k: 10000,
  w20k: 20000,
  w50k: 50000,
  w100k: 100000,
  w200k: 200000,
  jackpot: 500000,
}

export const TIP_LABELS: Record<TipResult, string> = {
  nothing: '꽝',
  w1k: '1,000 VND 💀',
  w2k: '2,000 VND 💀',
  w5k: '5,000 VND 💀',
  w10k: '10,000 VND',
  w20k: '20,000 VND',
  w50k: '50,000 VND',
  w100k: '100,000 VND',
  w200k: '200,000 VND',
  jackpot: '500,000 VND 💥',
}

export const DRINK_LABELS: Record<DrinkResult, string> = {
  p25:    '🍺 25%',
  p50:    '🍺🍺 50%',
  p70:    '🍺🍺🍺 70%',
  p100:   '🍺🍺🍺🍺 100%',
  respin: '🔄 RESPIN',
}

export const getTipTier = (tip: TipResult): TipTier => {
  if (tip === 'jackpot') return 'jackpot'
  if (tip === 'w200k') return 'high'
  if (tip === 'w100k') return 'mid-high'
  if (tip === 'w50k') return 'mid'
  if (tip === 'w10k' || tip === 'w20k') return 'low'
  if (tip === 'w1k' || tip === 'w2k' || tip === 'w5k') return 'curse'
  return 'nothing'
}

export const isHighValue = (tip: TipResult): boolean => {
  return ['w50k', 'w100k', 'w200k', 'jackpot'].includes(tip)
}

export const isLowValue = (tip: TipResult): boolean => {
  return ['nothing', 'w1k', 'w2k', 'w5k', 'w10k', 'w20k'].includes(tip)
}

export const TIP_REEL_ORDER: TipResult[] = [
  'nothing', 'w1k', 'w2k', 'w5k', 'w10k', 'w20k',
  'w50k', 'w100k', 'w200k', 'jackpot'
]

export const DRINK_REEL_ORDER: DrinkResult[] = [
  'p25', 'p50', 'p70', 'p100', 'respin'
]
