import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TipResult, DrinkResult,
  TIP_REEL_ORDER, DRINK_REEL_ORDER,
  TIP_LABELS, DRINK_LABELS,
} from '../types/game'

// ─── 타입 ────────────────────────────────────────────────────────────────────
export type SpinPhase =
  | 'idle'
  | 'spinning'
  | 'nearMiss'
  | 'stopping'
  | 'tipRevealed'
  | 'drinkRevealed'
  | 'celebration'
  | 'billboard'

interface SlotReelProps {
  type:      'tip' | 'drink'
  phase:     SpinPhase
  result:    TipResult | DrinkResult | null
  nearMiss?: TipResult | DrinkResult | null
  className?: string
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const CELL_H       = 72
const VISIBLE      = 5          // 홀수 → 가운데가 결과칸
const CENTER       = Math.floor(VISIBLE / 2)   // 2
const FAST_TICK_MS = 50         // 고속 회전 간격

// 감속 스텝 ms — 카지노 실측 기반 (점점 느려짐)
const DECEL = [60, 90, 130, 180, 250, 340, 460, 600]

// ─── 색상 ────────────────────────────────────────────────────────────────────
function colorOf(type: 'tip' | 'drink', key: string): string {
  if (type === 'tip') {
    const m: Record<string, string> = {
      nothing: '#6b7280',
      w1k: '#a3e635', w2k: '#a3e635',
      w5k: '#34d399',
      w10k: '#38bdf8', w20k: '#38bdf8',
      w50k: '#a78bfa',
      w100k: '#f472b6',
      w200k: '#fb923c',
      jackpot: '#fbbf24',
    }
    return m[key] ?? '#6b7280'
  } else {
    const m: Record<string, string> = {
      p25: '#34d399', p50: '#38bdf8',
      p70: '#a78bfa', p100: '#f472b6',
      respin: '#fbbf24',
    }
    return m[key] ?? '#6b7280'
  }
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function buildWindow(order: readonly string[], topIdx: number): string[] {
  return Array.from({ length: VISIBLE }, (_, i) =>
    order[(topIdx + i) % order.length]
  )
}

// topIdx when targetIdx sits at CENTER
function topForCenter(order: readonly string[], targetIdx: number): number {
  const len = order.length
  return ((targetIdx - CENTER) % len + len) % len
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
const SlotReel: React.FC<SlotReelProps> = ({
  type, phase, result, nearMiss, className = '',
}) => {
  const order  = type === 'tip' ? TIP_REEL_ORDER  : DRINK_REEL_ORDER
  const labels = type === 'tip' ? TIP_LABELS       : DRINK_LABELS

  const [window, setWindow]   = useState<string[]>(() => buildWindow(order, 0))
  const [revealed, setRevealed] = useState(false)
  const [flash, setFlash]     = useState(false)
  const [shimmy, setShimmy]   = useState(false)

  const topRef      = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 헬퍼 ─────────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (timerRef.current)    { clearTimeout(timerRef.current);     timerRef.current    = null }
  }, [])

  const tick = useCallback(() => {
    topRef.current = (topRef.current + 1) % order.length
    setWindow(buildWindow(order, topRef.current))
  }, [order])

  const snapTo = useCallback((targetIdx: number) => {
    topRef.current = topForCenter(order, targetIdx)
    setWindow(buildWindow(order, topRef.current))
  }, [order])

  // ── 감속 → 최종 snap ─────────────────────────────────────────────────────
  const startDecel = useCallback((finalResult: string) => {
    clearAll()
    const finalIdx = order.indexOf(finalResult)
    if (finalIdx < 0) return

    // 니어미스: 결과 2칸 앞에서 흔들림
    const len = order.length
    const pre1 = ((finalIdx - 2 + len) % len)
    const pre2 = ((finalIdx - 1 + len) % len)

    let step = 0
    const sequence: Array<{ type: 'snap'; idx: number } | { type: 'tick' }> = [
      { type: 'snap', idx: pre1 },   // 니어미스 -2
      { type: 'snap', idx: pre2 },   // 니어미스 -1  (아슬아슬하게 지나침)
      { type: 'tick' }, { type: 'tick' }, { type: 'tick' }, // 감속 틱
      { type: 'snap', idx: finalIdx }, // 최종 결과 정확히 착지
    ]

    const delays = [70, 110, DECEL[2], DECEL[4], DECEL[6], 0]

    const runNext = () => {
      if (step >= sequence.length) return
      const s = sequence[step]
      if (s.type === 'snap') snapTo(s.idx)
      else tick()

      step++
      if (step < sequence.length) {
        timerRef.current = setTimeout(runNext, delays[step] ?? 100)
      } else {
        // 완전히 착지 후 reveal
        setRevealed(true)
        setShimmy(true)
        setTimeout(() => setShimmy(false), 500)
        setFlash(true)
        setTimeout(() => setFlash(false), 300)
      }
    }

    timerRef.current = setTimeout(runNext, 0)
  }, [order, clearAll, snapTo, tick])

  // ── Phase 처리 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'idle') {
      clearAll()
      setRevealed(false)
      setFlash(false)
      topRef.current = 0
      setWindow(buildWindow(order, 0))
      return
    }

    if (phase === 'spinning') {
      clearAll()
      setRevealed(false)
      intervalRef.current = setInterval(tick, FAST_TICK_MS)
      return
    }

    // nearMiss / stopping / tipRevealed / drinkRevealed 모두
    // result가 세팅된 시점에 감속 시작
    if (
      phase === 'nearMiss' ||
      phase === 'stopping' ||
      phase === 'tipRevealed' ||
      phase === 'drinkRevealed'
    ) {
      if (result) {
        clearAll()  // 고속 인터벌 중단
        startDecel(result as string)
      }
      return
    }

    return () => clearAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result])

  // ── 색상 계산 ─────────────────────────────────────────────────────────────
  const centerItem   = window[CENTER]
  const centerColor  = colorOf(type, centerItem)
  const resultColor  = result ? colorOf(type, result as string) : '#6b7280'
  const borderColor  = revealed ? resultColor : '#374151'
  const glowColor    = revealed ? resultColor : 'transparent'

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>

      {/* 헤더 */}
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
        {type === 'tip' ? '💰 TIP' : '🍺 DRINK'}
      </div>

      {/* 릴 윈도우 */}
      <div
        className="relative overflow-hidden rounded-2xl border-2"
        style={{
          width: 130,
          height: CELL_H * VISIBLE,
          borderColor,
          boxShadow: revealed
            ? `0 0 28px ${glowColor}88, 0 0 8px ${glowColor}44`
            : '0 4px 20px #0009',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          background: '#0d1117',
        }}
      >
        {/* 상단 마스크 */}
        <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
          style={{ height: CELL_H * 2, background: 'linear-gradient(to bottom, #0d1117 0%, transparent 100%)' }}
        />
        {/* 하단 마스크 */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ height: CELL_H * 2, background: 'linear-gradient(to top, #0d1117 0%, transparent 100%)' }}
        />

        {/* 중앙 하이라이트 바 */}
        <div
          className="absolute inset-x-0 z-20 pointer-events-none rounded-lg"
          style={{
            top: CENTER * CELL_H + 4,
            height: CELL_H - 8,
            border: `2px solid ${revealed ? resultColor : '#4b556388'}`,
            background: revealed ? `${resultColor}14` : 'transparent',
            transition: 'border-color 0.2s, background 0.2s',
            margin: '0 4px',
          }}
        />

        {/* 아이템 목록 */}
        <motion.div
          animate={shimmy ? { x: [-5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {window.map((item, i) => {
            const isCenter = i === CENTER
            const iColor   = colorOf(type, item)
            const dist     = Math.abs(i - CENTER)
            const blur     = revealed ? 0 : dist * 1.8
            const scale    = isCenter && revealed ? 1.1 : 1
            const opacity  = isCenter ? 1 : Math.max(0.3, 1 - dist * 0.25)

            return (
              <div
                key={`${i}-${item}`}
                className="flex items-center justify-center font-bold"
                style={{
                  height: CELL_H,
                  fontSize: isCenter ? 14 : 11,
                  color: iColor,
                  opacity,
                  filter: `blur(${blur}px)`,
                  transform: `scale(${scale})`,
                  transition: 'filter 0.15s, transform 0.15s, opacity 0.15s',
                  textShadow: isCenter && revealed ? `0 0 14px ${iColor}` : 'none',
                  textAlign: 'center',
                  padding: '0 8px',
                  lineHeight: 1.2,
                  userSelect: 'none',
                }}
              >
                {labels[item as keyof typeof labels] ?? item}
              </div>
            )
          })}
        </motion.div>

        {/* 결과 플래시 */}
        <AnimatePresence>
          {flash && result && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.65 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30 rounded-2xl pointer-events-none"
              style={{ background: resultColor }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 결과 레이블 */}
      <AnimatePresence>
        {revealed && result && (
          <motion.div
            key="label"
            initial={{ scale: 0.4, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            className="mt-3 px-4 py-1.5 rounded-full text-sm font-extrabold text-black"
            style={{
              background: resultColor,
              boxShadow: `0 0 14px ${resultColor}88`,
            }}
          >
            {labels[result as keyof typeof labels] ?? result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SlotReel
