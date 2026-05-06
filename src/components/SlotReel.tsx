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
  | 'drinkStopping'
  | 'drinkRevealed'
  | 'tipStopping'
  | 'tipRevealed'
  | 'celebration'
  | 'billboard'

interface SlotReelProps {
  type:       'tip' | 'drink'
  phase:      SpinPhase
  result:     TipResult | DrinkResult | null
  className?: string
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const CELL_H   = 72
const VISIBLE  = 5
const CENTER   = Math.floor(VISIBLE / 2)  // 2
const FAST_MS  = 48   // 고속 회전 간격

// 감속 스텝 — 카지노 실측 기반 (ms)
const DECEL = [65, 95, 135, 185, 255, 345, 460, 600]

// ─── 색상 헬퍼 ───────────────────────────────────────────────────────────────
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

function topForCenter(order: readonly string[], targetIdx: number): number {
  const len = order.length
  return ((targetIdx - CENTER) % len + len) % len
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
const SlotReel: React.FC<SlotReelProps> = ({ type, phase, result, className = '' }) => {
  const order  = type === 'tip' ? (TIP_REEL_ORDER  as readonly string[]) : (DRINK_REEL_ORDER as readonly string[])
  const labels = type === 'tip' ? TIP_LABELS : DRINK_LABELS

  const [window_, setWindow]  = useState<string[]>(() => buildWindow(order, 0))
  const [revealed, setRevealed] = useState(false)
  const [flash,    setFlash]    = useState(false)
  const [shimmy,   setShimmy]   = useState(false)
  const [waiting,  setWaiting]  = useState(false)   // DRINK 확정 후 TIP 대기 상태

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
    const finalIdx = (order as string[]).indexOf(finalResult)
    if (finalIdx < 0) return

    const len  = order.length
    const pre1 = ((finalIdx - 2 + len) % len)
    const pre2 = ((finalIdx - 1 + len) % len)

    // 시퀀스: 니어미스 2칸 → 감속 틱 3회 → 최종 착지
    type Step = { type: 'snap'; idx: number } | { type: 'tick' } | { type: 'final'; idx: number }
    const seq: Step[] = [
      { type: 'snap',  idx: pre1   },
      { type: 'snap',  idx: pre2   },
      { type: 'tick'               },
      { type: 'tick'               },
      { type: 'tick'               },
      { type: 'final', idx: finalIdx },
    ]
    const delays = [80, 120, DECEL[3], DECEL[5], DECEL[7], 0]

    let step = 0
    const runNext = () => {
      if (step >= seq.length) return
      const s = seq[step]
      if (s.type === 'snap')  snapTo(s.idx)
      else if (s.type === 'tick') tick()
      else {
        // 최종 착지
        snapTo(s.idx)
        setRevealed(true)
        setShimmy(true)
        setTimeout(() => setShimmy(false), 500)
        setFlash(true)
        setTimeout(() => setFlash(false), 320)
        return
      }
      step++
      timerRef.current = setTimeout(runNext, delays[step] ?? 120)
    }
    timerRef.current = setTimeout(runNext, 0)
  }, [order, clearAll, snapTo, tick])

  // ── Phase 처리 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'idle') {
      clearAll()
      setRevealed(false)
      setFlash(false)
      setWaiting(false)
      topRef.current = 0
      setWindow(buildWindow(order, 0))
      return
    }

    if (phase === 'spinning') {
      clearAll()
      setRevealed(false)
      setWaiting(false)
      intervalRef.current = setInterval(tick, FAST_MS)
      return
    }

    // DRINK 릴: drinkStopping phase에 감속 시작
    if (type === 'drink' && phase === 'drinkStopping' && result) {
      startDecel(result as string)
      return
    }

    // DRINK 릴: drinkRevealed phase — 고속 정지 상태 유지 (이미 revealed)
    if (type === 'drink' && phase === 'drinkRevealed') {
      // 이미 revealed 처리됨 — 아무것도 안 함
      return
    }

    // TIP 릴: drinkRevealed 구간에는 계속 고속 회전 유지 + 대기 표시
    if (type === 'tip' && phase === 'drinkRevealed') {
      setWaiting(true)
      // 고속 회전 유지 (spinning에서 이미 시작된 interval 그대로)
      return
    }

    // TIP 릴: tipStopping phase에 감속 시작
    if (type === 'tip' && phase === 'tipStopping' && result) {
      setWaiting(false)
      startDecel(result as string)
      return
    }

    // tipRevealed 이후 — 이미 revealed 상태 유지
    if (phase === 'tipRevealed' || phase === 'celebration' || phase === 'billboard') {
      return
    }

    return () => clearAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result])

  // ── 색상 계산 ─────────────────────────────────────────────────────────────
  const resultColor = result ? colorOf(type, result as string) : '#6b7280'
  const borderColor = revealed ? resultColor : (waiting ? '#fbbf2466' : '#374151')
  const glowColor   = revealed ? resultColor : 'transparent'

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>

      {/* 헤더 */}
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
        {type === 'tip' ? '💰 TIP' : '🍺 DRINK'}
      </div>

      {/* 릴 윈도우 */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 transition-all duration-300"
        style={{
          width: 130,
          height: CELL_H * VISIBLE,
          borderColor,
          boxShadow: revealed
            ? `0 0 32px ${glowColor}99, 0 0 10px ${glowColor}55`
            : waiting
              ? '0 0 18px #fbbf2444'
              : '0 4px 20px #0009',
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
            border: `2px solid ${revealed ? resultColor : waiting ? '#fbbf2455' : '#4b556344'}`,
            background: revealed ? `${resultColor}14` : 'transparent',
            transition: 'border-color 0.2s, background 0.2s',
            margin: '0 4px',
          }}
        />

        {/* 아이템 목록 */}
        <motion.div
          animate={shimmy ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {window_.map((item, i) => {
            const isCenter = i === CENTER
            const iColor   = colorOf(type, item)
            const dist     = Math.abs(i - CENTER)
            const blur     = revealed ? 0 : dist * 1.8
            const scale    = isCenter && revealed ? 1.1 : 1
            const opacity  = isCenter ? 1 : Math.max(0.25, 1 - dist * 0.28)

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
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              className="absolute inset-0 z-30 rounded-2xl pointer-events-none"
              style={{ background: resultColor }}
            />
          )}
        </AnimatePresence>

        {/* TIP 대기 중 — "?" 펄스 오버레이 */}
        <AnimatePresence>
          {waiting && type === 'tip' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="absolute inset-x-0 z-25 flex items-center justify-center pointer-events-none"
              style={{ top: CENTER * CELL_H, height: CELL_H }}
            >
              <span
                className="font-bebas text-3xl"
                style={{ color: '#fbbf24', textShadow: '0 0 12px #fbbf24' }}
              >
                ???
              </span>
            </motion.div>
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
