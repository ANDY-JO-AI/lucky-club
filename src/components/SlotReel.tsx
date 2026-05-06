import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TipResult, DrinkResult,
  TIP_REEL_ORDER, DRINK_REEL_ORDER,
  TIP_LABELS, DRINK_LABELS,
} from '../types/game'

export type ReelCommand = 'idle' | 'spin' | 'decel' | 'revealed'

export type SpinPhase =
  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'
  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'
  | 'nearMiss' | 'stopping'

interface SlotReelProps {
  type:      'tip' | 'drink'
  command:   ReelCommand
  result:    TipResult | DrinkResult | null
  className?: string
  onLanded?: () => void
}

const CELL_H  = 72
const VISIBLE = 5
const CENTER  = Math.floor(VISIBLE / 2)
const FAST_MS = 42

// 감속 스텝 — 프로 카지노 실측 기반
// 앞 3칸은 중간 속도, 마지막 2칸에서 극적으로 느려짐
const DECEL_MS = [60, 100, 150, 210, 290, 400, 560, 760, 1000, 1300]

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

function buildWindow(order: readonly string[], topIdx: number): string[] {
  return Array.from({ length: VISIBLE }, (_, i) =>
    order[(topIdx + i) % order.length]
  )
}

function topForCenter(order: readonly string[], targetIdx: number): number {
  const len = order.length
  return ((targetIdx - CENTER) % len + len) % len
}

const SlotReel: React.FC<SlotReelProps> = ({
  type, command, result, className = '', onLanded,
}) => {
  const order  = type === 'tip'
    ? (TIP_REEL_ORDER  as readonly string[])
    : (DRINK_REEL_ORDER as readonly string[])
  const labels = type === 'tip' ? TIP_LABELS : DRINK_LABELS

  const [window_,   setWindow]    = useState<string[]>(() => buildWindow(order, 0))
  const [revealed,  setRevealed]  = useState(false)
  const [flash,     setFlash]     = useState(false)
  const [shimmy,    setShimmy]    = useState(false)
  const [glowing,   setGlowing]   = useState(false)
  const [nearLabel, setNearLabel] = useState<string | null>(null)

  const topRef      = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── 카지노 감속 시퀀스 ────────────────────────────────────────────────────
  // 핵심: 5칸 앞에서 시작, 마지막 2칸은 거의 멈출 것처럼 극적으로 느려짐
  const startDecel = useCallback((finalResult: string) => {
    clearAll()
    const finalIdx = (order as string[]).indexOf(finalResult)
    if (finalIdx < 0) return
    const len = order.length

    const pre5 = ((finalIdx - 5 + len) % len)
    const pre4 = ((finalIdx - 4 + len) % len)
    const pre3 = ((finalIdx - 3 + len) % len)
    const pre2 = ((finalIdx - 2 + len) % len)
    const pre1 = ((finalIdx - 1 + len) % len)

    // 각 칸별 딜레이 — 뒤로 갈수록 극적으로 증가
    const steps: Array<{ idx: number; delay: number; near?: boolean }> = [
      { idx: pre5, delay: DECEL_MS[2] },          // 150ms — 슬슬 느려짐
      { idx: pre4, delay: DECEL_MS[4] },          // 290ms — 확실히 느려짐
      { idx: pre3, delay: DECEL_MS[6] },          // 560ms — 멈출 것 같음
      { idx: pre2, delay: DECEL_MS[8], near: true }, // 1000ms — 심장 쫄깃 1
      { idx: pre1, delay: DECEL_MS[9], near: true }, // 1300ms — 심장 쫄깃 2 (약올리기)
    ]

    let step = 0
    const runNext = () => {
      if (step >= steps.length) {
        // 최종 착지
        snapTo(finalIdx)
        setNearLabel(null)
        setRevealed(true)
        setGlowing(true)
        setShimmy(true)
        setTimeout(() => setShimmy(false), 600)
        setFlash(true)
        setTimeout(() => setFlash(false), 400)
        onLanded?.()
        return
      }
      const s = steps[step]
      snapTo(s.idx)
      // 니어미스 칸에서 라벨 표시 (심리 압박)
      if (s.near) {
        const nearItem = order[s.idx]
        setNearLabel(labels[nearItem as keyof typeof labels] ?? nearItem)
        setTimeout(() => setNearLabel(null), s.delay * 0.7)
      }
      step++
      timerRef.current = setTimeout(runNext, s.delay)
    }

    timerRef.current = setTimeout(runNext, DECEL_MS[0])
  }, [order, labels, clearAll, snapTo, onLanded])

  // ── Command 처리 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (command === 'idle') {
      clearAll()
      setRevealed(false)
      setFlash(false)
      setGlowing(false)
      setNearLabel(null)
      topRef.current = 0
      setWindow(buildWindow(order, 0))
      return
    }
    if (command === 'spin') {
      clearAll()
      setRevealed(false)
      setGlowing(false)
      setNearLabel(null)
      intervalRef.current = setInterval(tick, FAST_MS)
      return
    }
    if (command === 'decel' && result) {
      clearAll()
      startDecel(result as string)
      return
    }
    return () => clearAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, result])

  const resultColor = result ? colorOf(type, result as string) : '#6b7280'
  const borderColor = glowing ? resultColor : '#374151'

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>

      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
        {type === 'tip' ? '💰 TIP' : '🍺 DRINK'}
      </div>

      {/* 릴 윈도우 */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border-2"
        animate={glowing ? {
          boxShadow: [
            `0 0 24px ${resultColor}77`,
            `0 0 55px ${resultColor}dd`,
            `0 0 24px ${resultColor}77`,
          ]
        } : { boxShadow: '0 4px 20px #000a' }}
        transition={glowing ? { duration: 0.65, repeat: Infinity } : {}}
        style={{
          width: 130,
          height: CELL_H * VISIBLE,
          borderColor,
          background: '#0d1117',
          transition: 'border-color 0.2s',
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
        <motion.div
          className="absolute inset-x-0 z-20 pointer-events-none rounded-lg"
          animate={glowing ? {
            borderColor: [resultColor, `${resultColor}33`, resultColor],
            background:  [`${resultColor}22`, `${resultColor}06`, `${resultColor}22`],
          } : {}}
          transition={glowing ? { duration: 0.65, repeat: Infinity } : {}}
          style={{
            top: CENTER * CELL_H + 4,
            height: CELL_H - 8,
            border: `2px solid ${revealed ? resultColor : '#4b556333'}`,
            margin: '0 4px',
          }}
        />

        {/* 아이템 목록 */}
        <motion.div
          animate={shimmy ? { x: [-8, 8, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {window_.map((item, i) => {
            const isCenter = i === CENTER
            const iColor   = colorOf(type, item)
            const dist     = Math.abs(i - CENTER)
            const blur     = revealed ? 0 : dist * 2.2
            const scale    = isCenter && revealed ? 1.14 : 1
            const opacity  = isCenter ? 1 : Math.max(0.18, 1 - dist * 0.3)

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
                  transition: 'filter 0.1s, transform 0.1s, opacity 0.1s',
                  textShadow: isCenter && revealed
                    ? `0 0 18px ${iColor}, 0 0 36px ${iColor}88`
                    : 'none',
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

        {/* 니어미스 순간 중앙 라벨 펄스 */}
        <AnimatePresence>
          {nearLabel && (
            <motion.div
              key="near"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 0.6, 1], scale: [0.7, 1.1, 1] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 z-25 flex items-center justify-center pointer-events-none"
              style={{ top: CENTER * CELL_H, height: CELL_H }}
            >
              <span className="font-bebas text-xs text-white/60 bg-black/60 px-2 py-0.5 rounded-full">
                {nearLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 결과 플래시 */}
        <AnimatePresence>
          {flash && result && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-30 rounded-2xl pointer-events-none"
              style={{ background: resultColor }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 결과 레이블 */}
      <AnimatePresence>
        {revealed && result && (
          <motion.div
            key="label"
            initial={{ scale: 0.2, opacity: 0, y: 10 }}
            animate={{ scale: [0.2, 1.25, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14 }}
            className="mt-3 px-4 py-1.5 rounded-full text-sm font-extrabold text-black"
            style={{
              background: resultColor,
              boxShadow: `0 0 20px ${resultColor}bb`,
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
