// Slot Reel Component — 감속 효과 적용 버전
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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

function getTipColor(tip: TipResult): string {
  const tier = getTipTier(tip)
  switch (tier) {
    case 'jackpot':  return '#FFD700'
    case 'high':     return '#FFA500'
    case 'mid-high': return '#FFD700'
    case 'mid':      return '#C0C0C0'
    case 'curse':    return '#FF0000'
    default:         return '#FFFFFF'
  }
}

function getDrinkColor(drink: DrinkResult): string {
  switch (drink) {
    case 'p100':   return '#FF4500'
    case 'p70':    return '#FF6B00'
    case 'p50':    return '#FFA500'
    case 'p25':    return '#87CEEB'
    case 'respin': return '#39FF14'
    default:       return '#FFFFFF'
  }
}

export default function SlotReel({ type, phase, result, nearMiss, className = '' }: SlotReelProps) {
  const [visibleItems, setVisibleItems] = useState<string[]>([])
  const [shimmying, setShimmying]       = useState(false)
  const [revealed, setRevealed]         = useState(false)
  const [spinSpeed, setSpinSpeed]       = useState(80)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const iRef        = useRef(0)

  const reelOrder = type === 'tip' ? TIP_REEL_ORDER : DRINK_REEL_ORDER
  const labels    = type === 'tip' ? TIP_LABELS    : DRINK_LABELS

  const getWindow = (centerItem: string) => {
    const idx = reelOrder.indexOf(centerItem as TipResult & DrinkResult)
    const len = reelOrder.length
    return [
      labels[(reelOrder[(idx - 1 + len) % len]) as keyof typeof labels],
      labels[(reelOrder[idx])                   as keyof typeof labels],
      labels[(reelOrder[(idx + 1) % len])       as keyof typeof labels],
    ]
  }

  const clearTicker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // 감속 스케줄: 80ms → 120ms → 180ms → 260ms → 360ms → 500ms 순으로 느려짐
  const DECEL_STEPS = [80, 120, 180, 260, 360, 500]

  const startDecel = (targetItem: string) => {
    clearTicker()
    let stepIdx = 0

    const tick = () => {
      const speed = DECEL_STEPS[Math.min(stepIdx, DECEL_STEPS.length - 1)]
      setSpinSpeed(speed)
      iRef.current++
      const item = reelOrder[iRef.current % reelOrder.length]
      setVisibleItems(getWindow(item))

      stepIdx++
      if (stepIdx < DECEL_STEPS.length) {
        intervalRef.current = setTimeout(tick, speed) as unknown as ReturnType<typeof setInterval>
      } else {
        // 감속 완료 → 최종 결과로 고정
        setVisibleItems(getWindow(targetItem))
        setRevealed(true)
        setShimmying(false)
      }
    }

    intervalRef.current = setTimeout(tick, DECEL_STEPS[0]) as unknown as ReturnType<typeof setInterval>
  }

  useEffect(() => {
    if (phase === 'idle') {
      clearTicker()
      setRevealed(false)
      setShimmying(false)
      setSpinSpeed(80)
      const mid = Math.floor(reelOrder.length / 2)
      setVisibleItems(getWindow(reelOrder[mid]))
      return
    }

    if (phase === 'spinning') {
      clearTicker()
      setRevealed(false)
      setShimmying(false)
      setSpinSpeed(80)
      iRef.current = 0
      // 빠른 스크롤 시작
      intervalRef.current = setInterval(() => {
        iRef.current++
        const item = reelOrder[iRef.current % reelOrder.length]
        setVisibleItems(getWindow(item))
      }, 80)
      return
    }

    if (phase === 'nearMiss') {
      clearTicker()
      const item = nearMiss || (type === 'tip' ? TIP_REEL_ORDER[0] : DRINK_REEL_ORDER[0])
      setVisibleItems(getWindow(item as string))
      setShimmying(true)
      return
    }

    const isRevealPhase =
      (phase === 'tipRevealed'   && type === 'tip')   ||
      (phase === 'drinkRevealed' && type === 'drink') ||
      phase === 'celebration' ||
      phase === 'billboard'

    if (isRevealPhase && result) {
      setShimmying(false)
      // 감속 후 결과 표시
      startDecel(result as string)
    }
  }, [phase, result, nearMiss])

  useEffect(() => () => clearTicker(), [])

  const resultColor = revealed
    ? (type === 'tip'
        ? getTipColor(result as TipResult)
        : getDrinkColor(result as DrinkResult))
    : '#FFFFFF'

  const borderColor = type === 'tip' ? '#FFD700' : '#4FC3F7'
  const headerColor = type === 'tip' ? '#FFD700' : '#4FC3F7'
  const headerText  = type === 'tip' ? '💰 TIP'  : '🍺 DRINK'
  const isSpinning  = phase === 'spinning' || phase === 'nearMiss'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Header */}
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
        {/* 상단 그라디언트 마스크 */}
        <div className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />

        {/* 중앙 하이라이트 바 */}
        <div
          className="absolute inset-x-0 z-5 pointer-events-none border-y"
          style={{
            top: CELL_HEIGHT,
            height: CELL_HEIGHT,
            borderColor: revealed ? `${resultColor}60` : `${borderColor}30`,
            background: revealed ? `${resultColor}08` : 'transparent',
          }}
        />

        {/* 셀 목록 */}
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
                  filter: isSpinning ? `blur(${Math.max(0, (80 / Math.max(spinSpeed, 1)) * 1.5)}px)` : 'none',
                }}
              >
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* 결과 플래시 오버레이 */}
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

      {/* 결과 라벨 */}
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
