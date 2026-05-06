// Main Game Screen — complete rewrite with all bug fixes
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useGameStore } from '../store/gameStore'
import {
  spinSlots, getCompassTarget, shouldTriggerMission,
  getMissionLevel, getEscalationParams,
} from '../lib/casino'
import { startDrumroll, stopDrumroll, playSound, haptic, torchStrobe } from '../lib/sounds'
import {
  TIP_VALUES, getTipTier, DRINK_REEL_ORDER, TIP_REEL_ORDER,
  type TipResult, type DrinkResult,
} from '../types/game'
import { recordSpin } from '../lib/firebaseService'
import TopBar from '../components/TopBar'
import SlotReel from '../components/SlotReel'
import SpinButton from '../components/SpinButton'
import Billboard from '../components/Billboard'
import CompassWheel from '../components/CompassWheel'
import MissionCard from '../components/MissionCard'
import SettingsModal from '../components/SettingsModal'
import PlayerCountModal from '../components/PlayerCountModal'
import AdultPinModal from '../components/AdultPinModal'
import ParticleEffect from '../components/ParticleEffect'
import ScreenFlash from '../components/ScreenFlash'
import StreakCounter from '../components/StreakCounter'
import InstallBanner from '../components/InstallBanner'
import { DEFAULT_MISSIONS_KARAOKE } from '../lib/missions'

export type SpinPhase =
  | 'idle'
  | 'spinning'
  | 'nearMiss'
  | 'tipRevealed'
  | 'drinkRevealed'
  | 'celebration'
  | 'billboard'

export default function GameScreen() {
  const { t } = useTranslation()
  const store = useGameStore()

  // ── Spin state ──
  const [phase, setPhase]                   = useState<SpinPhase>('idle')
  const [tipResult, setTipResult]           = useState<TipResult | null>(null)
  const [drinkResult, setDrinkResult]       = useState<DrinkResult | null>(null)
  const [nearMissTip, setNearMissTip]       = useState<TipResult | null>(null)
  const [nearMissDrink, setNearMissDrink]   = useState<DrinkResult | null>(null)

  // ── Modal state ──
  const [showSettings, setShowSettings]     = useState(false)
  const [showPlayerCount, setShowPlayerCount] = useState(false)
  const [showAdultPin, setShowAdultPin]     = useState(false)

  // ── Effect state ──
  const [flashColor, setFlashColor]         = useState<string | null>(null)
  const [flashCount, setFlashCount]         = useState(0)
  const [showParticles, setShowParticles]   = useState<'gold' | 'skull' | 'fire' | null>(null)
  const [showSocialProof, setShowSocialProof] = useState(false)
  const [coinRainCount, setCoinRainCount]   = useState(0)
  const [questionMode, setQuestionMode]     = useState(false)
  const [showBeerSuggestion, setShowBeerSuggestion] = useState(false)

  // ── Timeout manager ──
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearAll  = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  const later     = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [])

  // ── Category handler ──
  const handleCategorySelect = (cat: typeof store.category) => {
    if (cat === 'adult' && !store.adultUnlocked) {
      setShowAdultPin(true)
      return
    }
    store.setCategory(cat)
    if (cat !== 'adult') store.setAdultUnlocked(false)
  }

  const handleAdultPinSuccess = () => {
    store.setAdultUnlocked(true)
    store.setCategory('adult')
    setShowAdultPin(false)
  }

  // ── Flash helper ──
  const triggerFlash = (color: string, count: number = 1) => {
    setFlashColor(color)
    setFlashCount(count)
  }

  // ── MAIN SPIN ──
  const doSpin = useCallback(() => {
    if (phase !== 'idle') return

    clearAll()

    // Reset all display state
    setPhase('spinning')
    setTipResult(null)
    setDrinkResult(null)
    setNearMissTip(null)
    setNearMissDrink(null)
    setShowParticles(null)
    setQuestionMode(false)
    setShowSocialProof(false)
    setFlashColor(null)
    store.setShowBillboard(false)
    store.setShowCompass(false)
    store.setShowMission(false)

    haptic('light')

    // ─ Compute result immediately ─
    const { tip, drink } = spinSlots(store.config, store.consecutiveLow)

    // Pre-compute tier & timing
    const tipTier    = getTipTier(tip)
    const celebDelay = tipTier === 'jackpot' ? 800 : tipTier === 'high' ? 600 : 0
    const isJackpot  = tipTier === 'jackpot'

    // ─ Escalation ─
    const { bpm, volume: escVol } = getEscalationParams(
      store.spinsWithoutJackpot, 80, store.volume
    )
    startDrumroll(
      store.config.escalationEnabled ? bpm : 80,
      store.config.escalationEnabled ? escVol : store.volume
    )

    // ─ Near-miss positions ─
    const tipIdx      = TIP_REEL_ORDER.indexOf(tip)
    const nearTipIdx  = (tipIdx - 1 + TIP_REEL_ORDER.length) % TIP_REEL_ORDER.length
    const drinkIdx    = DRINK_REEL_ORDER.indexOf(drink)
    const nearDrinkIdx = (drinkIdx - 1 + DRINK_REEL_ORDER.length) % DRINK_REEL_ORDER.length

    // ── Timeline ──

    // 1.8 s — near miss
    later(() => {
      setPhase('nearMiss')
      if (store.config.nearMissEnabled) {
        setNearMissTip(TIP_REEL_ORDER[nearTipIdx])
        setNearMissDrink(DRINK_REEL_ORDER[nearDrinkIdx])
      }
    }, 1800)

    // 2.4 s — TIP stops
    later(() => {
      setPhase('tipRevealed')
      stopDrumroll()
      setNearMissTip(null)
      setNearMissDrink(null)
      setTipResult(tip)
      playSound('slot_stop')
      haptic('light')
      // Celebration delay: show ??? for high/jackpot
      if ((tipTier === 'jackpot' || tipTier === 'high') && store.config.autoBillboard) {
        setQuestionMode(true)
      }
    }, 2400)

    // 2.8 s — DRINK stops
    later(() => {
      setPhase('drinkRevealed')
      setDrinkResult(drink)
      playSound('slot_stop')
      haptic('light')
      if (drink === 'p100') playSound('siren')
      else if (drink === 'p70') playSound('warning_beep')
    }, 2800)

    // 2.8 s + celebDelay — celebration effects
    later(() => {
      setPhase('celebration')
      setQuestionMode(false)

      // Stats
      store.incrementSpin()
      store.updateStreaks(tip)
      store.addTipAmount(TIP_VALUES[tip])

      // Record to Firebase (non-blocking)
      recordSpin(
        { tip, drink, timestamp: Date.now() },
        store.clubId
      ).catch(() => {})

      // Tier effects
      switch (tipTier) {
        case 'curse':
          triggerFlash('#FF0000', 3)
          playSound('sad_trombone')
          haptic('strong')
          setShowParticles('skull')
          break
        case 'nothing':
          triggerFlash('#222222', 1)
          playSound('sad_trombone')
          break
        case 'low':
          triggerFlash('#FFFFFF', 1)
          playSound('coin_single')
          break
        case 'mid':
          triggerFlash('#C0C0C0', 1)
          playSound('coin_cascade')
          setCoinRainCount(5)
          break
        case 'mid-high':
          triggerFlash('#FFD700', 1)
          playSound('fanfare_short')
          haptic('medium')
          setCoinRainCount(20)
          setShowParticles('gold')
          break
        case 'high':
          triggerFlash('#FFD700', 3)
          playSound('fanfare_long')
          haptic('strong')
          setCoinRainCount(50)
          setShowParticles('gold')
          break
        case 'jackpot':
          triggerFlash('#FFD700', 10)
          playSound('jackpot_777')
          haptic('continuous', 1500)
          torchStrobe(5)
          setCoinRainCount(100)
          setShowParticles('gold')
          store.incrementJackpot()
          store.resetEscalation()
          later(() => {
            setShowSocialProof(true)
            later(() => setShowSocialProof(false), 3000)
          }, 800)
          break
      }

      // Drink effects
      if (drink === 'p100') {
        setShowParticles('fire')
        haptic('continuous', 800)
      }
    }, 2800 + celebDelay)

    // 3.5 s + celebDelay — billboard
    later(() => {
      setPhase('billboard')
      store.setShowBillboard(true)

      // Beer club 5-spin suggestion
      if (
        store.category === 'beer' &&
        store.spinCount > 0 &&
        (store.spinCount + 1) % 5 === 0 &&
        tipTier !== 'jackpot'
      ) {
        later(() => {
          setShowBeerSuggestion(true)
          later(() => setShowBeerSuggestion(false), 3000)
        }, 400)
      }
    }, 3500 + celebDelay)

    // 4.2 s + celebDelay — compass + mission
    later(() => {
      if (
        (store.category === 'karaoke' || store.category === 'adult') &&
        drink !== 'respin'
      ) {
        const target = getCompassTarget(store.playerCount)
        store.setCompassTarget(target)
        later(() => store.setShowCompass(true), 150)
      }

      // Mission check (15% chance, not beer mode)
      if (store.category !== 'beer' && shouldTriggerMission()) {
        const lvNum = getMissionLevel(store.spinCount)
        const key   = `level${lvNum}` as 'level1' | 'level2' | 'level3'
        const list  = DEFAULT_MISSIONS_KARAOKE[key]
        if (list?.length) {
          const mission = list[Math.floor(Math.random() * list.length)]
          store.setCurrentMission(mission)
          later(() => store.setShowMission(true), 3000)
        }
      }
    }, 4200 + celebDelay)

    // Re-spin: auto-reset after billboard
    if (drink === 'respin') {
      later(() => {
        playSound('respin')
        store.setShowBillboard(false)
        later(() => resetToIdle(), 600)
      }, 5200 + celebDelay)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, store])

  const resetToIdle = () => {
    setPhase('idle')
    setTipResult(null)
    setDrinkResult(null)
    setFlashColor(null)
    setCoinRainCount(0)
    setShowParticles(null)
    setQuestionMode(false)
  }

  // ── Billboard dismiss ──
  const handleBillboardDismiss = useCallback(() => {
    if (!tipResult) return
    const tier = getTipTier(tipResult)
    // Jackpot uses its own dismiss button
    if (tier === 'jackpot') return
    store.setShowBillboard(false)
    resetToIdle()
  }, [tipResult, store])

  const handleJackpotDismiss = useCallback(() => {
    store.setShowBillboard(false)
    resetToIdle()
  }, [store])

  // ── Compass / Mission done ──
  const handleCompassDone = () => store.setShowCompass(false)

  const handleMissionDone = () => {
    store.setShowMission(false)
    store.setCurrentMission(null)
    // After mission, show compass if not beer
    if (store.category !== 'beer') {
      const target = getCompassTarget(store.playerCount)
      store.setCompassTarget(target)
      setTimeout(() => store.setShowCompass(true), 300)
    }
  }

  // ── Ad slot trigger ──
  const showAd = store.adSpinCounter >= 10

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative select-none">

      {/* Screen flash */}
      <ScreenFlash color={flashColor} count={flashCount} />

      {/* Coin rain */}
      {coinRainCount > 0 && (
        <CoinRain count={coinRainCount} onDone={() => setCoinRainCount(0)} />
      )}

      {/* Particles */}
      {showParticles && (
        <ParticleEffect type={showParticles} onDone={() => setShowParticles(null)} />
      )}

      {/* Top bar */}
      <TopBar
        onSettingsOpen={() => setShowSettings(true)}
        onPlayerCountEdit={() => setShowPlayerCount(true)}
      />

      {/* Category selector */}
      <CategorySelector current={store.category} onSelect={handleCategorySelect} />

      {/* Streak counter */}
      <StreakCounter />

      {/* Slot reels */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3 py-2">
        <div className="flex gap-3 w-full max-w-sm">
          <SlotReel
            type="tip"
            phase={phase}
            result={tipResult}
            nearMiss={nearMissTip}
            className="flex-1"
          />
          <SlotReel
            type="drink"
            phase={phase}
            result={drinkResult}
            nearMiss={nearMissDrink}
            className="flex-1"
          />
        </div>

        {/* ??? pulsing for high/jackpot celebration delay */}
        <AnimatePresence>
          {questionMode && (
            <motion.div
              key="question"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="font-bebas text-7xl text-[#FFD700] select-none"
              style={{ textShadow: '0 0 20px #FFD700, 0 0 40px #FF8C00' }}
            >
              ???
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social proof */}
        <AnimatePresence>
          {showSocialProof && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="font-noto text-center text-[#FFD700] font-bold text-base px-4 py-2 rounded-xl border border-[#FFD700]/40 bg-[#FFD700]/10"
            >
              {t('jackpotProof', { count: store.jackpotCount })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beer club 5-spin no-jackpot nudge */}
        <AnimatePresence>
          {showBeerSuggestion && store.category === 'beer' && (
            <motion.div
              key="beer-nudge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="font-noto font-bold text-[#FF69B4] text-center text-sm px-4 py-2 rounded-xl border border-[#FF69B4]/30 bg-[#FF69B4]/10"
            >
              {t('noJackpotYet')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SPIN button */}
      <div className="px-4 pb-6 pt-2">
        <SpinButton
          phase={phase}
          onSpin={doSpin}
          tipResult={tipResult}
          drinkResult={drinkResult}
        />
      </div>

      {/* Billboard overlay */}
      <AnimatePresence>
        {store.showBillboard && tipResult && drinkResult && (
          <Billboard
            tipResult={tipResult}
            drinkResult={drinkResult}
            onDismiss={handleBillboardDismiss}
            onJackpotDismiss={handleJackpotDismiss}
            onSpinAgain={() => {
              store.setShowBillboard(false)
              resetToIdle()
            }}
          />
        )}
      </AnimatePresence>

      {/* Compass */}
      <AnimatePresence>
        {store.showCompass && store.compassTarget !== null && (
          <CompassWheel
            targetIndex={store.compassTarget}
            playerCount={store.playerCount}
            onDone={handleCompassDone}
          />
        )}
      </AnimatePresence>

      {/* Mission card */}
      <AnimatePresence>
        {store.showMission && store.currentMission && (
          <MissionCard mission={store.currentMission} onDone={handleMissionDone} />
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* Player count modal */}
      <AnimatePresence>
        {showPlayerCount && <PlayerCountModal onClose={() => setShowPlayerCount(false)} />}
      </AnimatePresence>

      {/* Adult PIN modal */}
      <AnimatePresence>
        {showAdultPin && (
          <AdultPinModal
            correctPin={store.config.adultPIN}
            onSuccess={handleAdultPinSuccess}
            onCancel={() => setShowAdultPin(false)}
          />
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Ad slot — Phase 2 */}
      <AnimatePresence>
        {showAd && (
          <AdSlotPlaceholder onClose={() => store.resetAdCounter()} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Category Selector ────────────────────────────────────────────────────────
function CategorySelector({
  current,
  onSelect,
}: {
  current: string
  onSelect: (cat: 'beer' | 'karaoke' | 'adult') => void
}) {
  const { t } = useTranslation()
  const cats = [
    { id: 'beer'    as const, label: t('beerClub') },
    { id: 'karaoke' as const, label: t('karaoke')  },
    { id: 'adult'   as const, label: t('adult')    },
  ]
  return (
    <div className="flex gap-2 px-4 pt-2 pb-1">
      {cats.map(cat => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.93 }}
          onClick={() => onSelect(cat.id)}
          className={`flex-1 py-2.5 rounded-xl font-noto font-bold text-sm transition-all duration-200 border-2 ${
            current === cat.id
              ? 'bg-[#FFD700] text-black border-[#FFD700]'
              : 'bg-transparent text-white/60 border-white/20'
          }`}
          style={current === cat.id ? { boxShadow: '0 0 12px rgba(255,215,0,0.5)' } : {}}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  )
}

// ─── Coin Rain ────────────────────────────────────────────────────────────────
function CoinRain({ count, onDone }: { count: number; onDone: () => void }) {
  const coins = Array.from({ length: Math.min(count, 60) }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 1.5 + Math.random() * 1.2,
  }))

  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9997]">
      {coins.map(c => (
        <motion.div
          key={c.id}
          className="absolute text-2xl"
          style={{ left: `${c.x}%`, top: -40 }}
          animate={{ y: '110vh', rotate: 540 }}
          transition={{ duration: c.dur, delay: c.delay, ease: 'easeIn' }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  )
}

// ─── Ad Slot Placeholder ──────────────────────────────────────────────────────
// PHASE 2: Replace with AdMob unit ID
function AdSlotPlaceholder({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-x-4 bottom-24 z-[9990] flex items-center justify-center"
    >
      <div className="w-full max-w-xs bg-gray-900/90 border border-gray-600/50 rounded-xl px-6 py-3 flex items-center justify-between">
        <span className="text-gray-500 text-xs font-mono">
          {/* PHASE 2: Replace with AdMob unit ID */}
          AD — 320×50
        </span>
        <button onClick={onClose} className="text-gray-600 text-xs ml-4">✕</button>
      </div>
    </motion.div>
  )
}
