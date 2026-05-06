// Slot Reel Component with full animation
import React, { useEffect, useRef, useState } from 'react'
import { motion, animate } from 'framer-motion'
import {
  TipResult, DrinkResult,
  TIP_REEL_ORDER, DRINK_REEL_ORDER,
  TIP_LABELS, DRINK_LABELS,
  getTipTier
} from '../types/game'

type SpinPhase = 'idle' | 'spinning' | 'nearMiss' | 'stopping' | 'tipRevealed' | 'drinkRevealed' | 'celebration' | 'billboard'

interface SlotReelProps {
  type: 'tip' | 'drink'
  phase: SpinPhase
  result: TipResult | DrinkResult | null
  nearMiss: TipResult | DrinkResult | null
  className?: string
}

const CELL_HEIGHT = 72

// Colors for tip tiers
function getTipColor(tip: TipResult): string {
  const tier = getTipTier(tip)
  switch (tier) {
    case 'jackpot': return '#FFD700'
    case 'high':    return '#FFA500'
    case 'mid-high': return '#FFD700'
    case 'mid':     return '#C0C0C0'
    case 'curse':   return '#FF0000'
    default:        return '#FFFFFF'
  }
}

function getDrinkColor(drink: DrinkResult): string {
  switch (drink) {
    case 'p100':  return '#FF4500'
    case 'p70':   return '#FF6B00'
    case 'p50':   return '#FFA500'
    case 'p25':   return '#87CEEB'
    case 'respin': return '#39FF14'
    default:      return '#FFFFFF'
  }
}

export default function SlotReel({ type, phase, result, nearMiss, className = '' }: SlotReelProps) {
  const [visibleItems, setVisibleItems] = useState<string[]>([])
  const [centerIdx, setCenterIdx] = useState(1)
  const [shimmying, setShimmying] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reelOrder = type === 'tip' ? TIP_REEL_ORDER : DRINK_REEL_ORDER
  const labels = type === 'tip' ? TIP_LABELS : DRINK_LABELS

  // Build 3-item window from reel
  const getWindow = (centerItem: string) => {
    const idx = reelOrder.indexOf(centerItem as TipResult & DrinkResult)
    const len = reelOrder.length
    return [
      labels[(reelOrder[(idx - 1 + len) % len]) as keyof typeof labels],
      labels[(reelOrder[idx]) as keyof typeof labels],
      labels[(reelOrder[(idx + 1) % len]) as keyof typeof labels],
    ]
  }

  useEffect(() => {
    if (phase === 'idle') {
      setRevealed(false)
      setShimmying(false)
      // Show default center
      const mid = Math.floor(reelOrder.length / 2)
      setVisibleItems(getWindow(reelOrder[mid]))
      setCenterIdx(1)
      return
    }

    if (phase === 'spinning') {
      setRevealed(false)
      setShimmying(false)
      // Start fast scroll simulation
      let i = 0
      intervalRef.current = setInterval(() => {
        const item = reelOrder[i % reelOrder.length]
        setVisibleItems(getWindow(item))
        i++
      }, 80)
      return
    }

    if (phase === 'nearMiss') {
      // Show near-miss item
      const item = nearMiss || (type === 'tip' ? TIP_REEL_ORDER[0] : DRINK_REEL_ORDER[0])
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setVisibleItems(getWindow(item as string))
      setShimmying(true)
      return
    }

    if ((phase === 'tipRevealed' && type === 'tip') ||
        (phase === 'drinkRevealed' && type === 'drink') ||
        (phase === 'celebration') ||
        (phase === 'billboard')) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setShimmying(false)
      if (result) {
        setVisibleItems(getWindow(result as string))
        setRevealed(true)
      }
    }
  }, [phase, result, nearMiss])

  // Cleanup
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const isSpinning = phase === 'spinning' || phase === 'nearMiss'
  const displayResult = result || (type === 'tip' ? 'w50k' as TipResult : 'p50' as DrinkResult)

  const resultColor = revealed
    ? (type === 'tip' ? getTipColor(result as TipResult) : getDrinkColor(result as DrinkResult))
    : '#FFFFFF'

  const borderColor = type === 'tip' ? '#FFD700' : '#4FC3F7'
  const headerColor = type === 'tip' ? '#FFD700' : '#4FC3F7'
  const headerText = type === 'tip' ? '💰 TIP' : '🍺 DRINK'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Header label */}
      <div
        className="font-bebas text-sm tracking-widest"
        style={{ color: headerColor, textShadow: `0 0 7px ${headerColor}` }}
      >
        {headerText}
      </div>

      {/* Reel window */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border-2"
        style={{
          borderColor: revealed ? resultColor : borderColor,
          boxShadow: revealed
            ? `0 0 15px ${resultColor}, 0 0 30px ${resultColor}40`
            : `0 0 7px ${borderColor}60`,
          width: '100%',
          height: `${CELL_HEIGHT * 3}px`,
          background: '#0a0a0a',
        }}
        animate={shimmying ? { y: [0, -8, 8, -4, 4, 0] } : {}}
        transition={shimmying ? { duration: 0.4, ease: 'easeInOut' } : {}}
      >
        {/* Top/bottom gradient masks */}
        <div className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />

        {/* Center highlight bar */}
        <div
          className="absolute inset-x-0 z-5 pointer-events-none border-y"
          style={{
            top: CELL_HEIGHT,
            height: CELL_HEIGHT,
            borderColor: revealed ? `${resultColor}60` : `${borderColor}30`,
            background: revealed ? `${resultColor}08` : 'transparent',
          }}
        />

        {/* Cells */}
        <div className="relative" style={{ height: `${CELL_HEIGHT * 3}px` }}>
          {visibleItems.map((item, i) => (
            <motion.div
              key={`${item}-${i}`}
              className="absolute inset-x-0 flex items-center justify-center px-1"
              style={{ top: i * CELL_HEIGHT, height: CELL_HEIGHT }}
              animate={isSpinning ? { opacity: [0.3, 1, 0.3] } : {}}
              transition={isSpinning ? { duration: 0.15, repeat: Infinity } : {}}
            >
              <span
                className={`font-bebas text-center leading-tight transition-all duration-300 ${
                  i === 1 ? 'text-lg' : 'text-xs opacity-50'
                }`}
                style={{
                  color: i === 1 && revealed ? resultColor : '#FFFFFF',
                  textShadow: i === 1 && revealed ? `0 0 10px ${resultColor}` : 'none',
                  fontSize: i === 1 ? (item.length > 15 ? '12px' : '14px') : '10px',
                  lineHeight: '1.1',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  padding: '0 4px',
                  filter: isSpinning ? 'blur(1px)' : 'none',
                }}
              >
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Revealed flash overlay */}
        {revealed && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: `radial-gradient(ellipse at center, ${resultColor}40, transparent)` }}
          />
        )}
      </motion.div>

      {/* Result label below reel */}
      {revealed && result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="font-noto font-black text-center text-xs px-2"
          style={{ color: resultColor, textShadow: `0 0 8px ${resultColor}` }}
        >
          {labels[result as keyof typeof labels]}
        </motion.div>
      )}
    </div>
  )
}
