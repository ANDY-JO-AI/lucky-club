// Zustand game store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Category, Language, SpinResult, Mission, ClubConfig,
  DEFAULT_CONFIG, TipResult, DrinkResult, getTipTier, isHighValue, isLowValue
} from '../types/game'

interface GameStore {
  // Language & onboarding
  language: Language
  languageSelected: boolean
  setLanguage: (lang: Language) => void

  // Category & mode
  category: Category
  setCategory: (cat: Category) => void
  adultUnlocked: boolean
  setAdultUnlocked: (v: boolean) => void

  // Player count
  playerCount: number
  setPlayerCount: (n: number) => void

  // Game config
  config: ClubConfig
  setConfig: (cfg: ClubConfig) => void

  // Spin state
  isSpinning: boolean
  setIsSpinning: (v: boolean) => void

  currentResult: SpinResult | null
  setCurrentResult: (r: SpinResult | null) => void

  showBillboard: boolean
  setShowBillboard: (v: boolean) => void

  // Streak / addiction mechanics
  spinCount: number
  spinsWithoutJackpot: number
  consecutiveLow: number
  consecutiveHigh: number
  incrementSpin: () => void
  updateStreaks: (tip: TipResult) => void
  resetEscalation: () => void

  // Jackpot social proof
  jackpotCount: number
  incrementJackpot: () => void

  // Compass
  compassTarget: number | null
  showCompass: boolean
  setCompassTarget: (n: number | null) => void
  setShowCompass: (v: boolean) => void

  // Mission
  currentMission: Mission | null
  showMission: boolean
  setCurrentMission: (m: Mission | null) => void
  setShowMission: (v: boolean) => void

  // Sound
  isMuted: boolean
  volume: number
  setMuted: (v: boolean) => void
  setVolume: (v: number) => void

  // Stats
  totalTipToday: number
  addTipAmount: (amount: number) => void

  // Session
  clubId: string
  setClubId: (id: string) => void

  // Ad tracking
  adSpinCounter: number
  incrementAdCounter: () => void
  resetAdCounter: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Language
      language: 'ko',
      languageSelected: false,
      setLanguage: (lang) => set({ language: lang, languageSelected: true }),

      // Category
      category: 'beer',
      setCategory: (cat) => set({ category: cat }),
      adultUnlocked: false,
      setAdultUnlocked: (v) => set({ adultUnlocked: v }),

      // Player count
      playerCount: 4,
      setPlayerCount: (n) => set({ playerCount: Math.min(Math.max(n, 2), 20) }),

      // Config
      config: DEFAULT_CONFIG,
      setConfig: (cfg) => set({ config: cfg }),

      // Spin state
      isSpinning: false,
      setIsSpinning: (v) => set({ isSpinning: v }),

      currentResult: null,
      setCurrentResult: (r) => set({ currentResult: r }),

      showBillboard: false,
      setShowBillboard: (v) => set({ showBillboard: v }),

      // Streaks
      spinCount: 0,
      spinsWithoutJackpot: 0,
      consecutiveLow: 0,
      consecutiveHigh: 0,

      incrementSpin: () => set(s => ({
        spinCount: s.spinCount + 1,
        spinsWithoutJackpot: s.spinsWithoutJackpot + 1,
        adSpinCounter: s.adSpinCounter + 1,
      })),

      updateStreaks: (tip: TipResult) => set(s => {
        if (isHighValue(tip)) {
          return { consecutiveLow: 0, consecutiveHigh: s.consecutiveHigh + 1 }
        } else if (isLowValue(tip)) {
          return { consecutiveLow: s.consecutiveLow + 1, consecutiveHigh: 0 }
        }
        return {}
      }),

      resetEscalation: () => set({ spinsWithoutJackpot: 0 }),

      // Jackpot
      jackpotCount: 0,
      incrementJackpot: () => set(s => ({ jackpotCount: s.jackpotCount + 1 })),

      // Compass
      compassTarget: null,
      showCompass: false,
      setCompassTarget: (n) => set({ compassTarget: n }),
      setShowCompass: (v) => set({ showCompass: v }),

      // Mission
      currentMission: null,
      showMission: false,
      setCurrentMission: (m) => set({ currentMission: m }),
      setShowMission: (v) => set({ showMission: v }),

      // Sound
      isMuted: false,
      volume: 0.8,
      setMuted: (v) => set({ isMuted: v }),
      setVolume: (v) => set({ volume: v }),

      // Stats
      totalTipToday: 0,
      addTipAmount: (amount) => set(s => ({ totalTipToday: s.totalTipToday + amount })),

      // Club
      clubId: 'default',
      setClubId: (id) => set({ clubId: id }),

      // Ad
      adSpinCounter: 0,
      incrementAdCounter: () => set(s => ({ adSpinCounter: s.adSpinCounter + 1 })),
      resetAdCounter: () => set({ adSpinCounter: 0 }),
    }),
    {
      name: 'lucky-club-storage',
      partialize: (s) => ({
        language: s.language,
        languageSelected: s.languageSelected,
        category: s.category,
        playerCount: s.playerCount,
        isMuted: s.isMuted,
        volume: s.volume,
        clubId: s.clubId,
        config: s.config,
      })
    }
  )
)
