import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TipResult, DrinkResult,
  TIP_REEL_ORDER, DRINK_REEL_ORDER,
  TIP_LABELS, DRINK_LABELS,
} from '../types/game'

// ─── 타입 ────────────────────────────────────────────────────────────────────
// command로 각 릴을 완전 독립 제어
export type ReelCommand =
  | 'idle'       // 정지
  | 'spin'       // 고속 회전 시작
  | 'decel'      // 감속 → 착지 (result 필수)
  | 'revealed'   // 착지 완료 상태 유지

// 하위 호환을 위해 SpinPhase도 export 유지
export type SpinPhase =
  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'
  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'
  | 'nearMiss' | 'stopping'

interface SlotReelProps {
  type:       'tip' | 'drink'
  command:    ReelCommand
  result:     TipResult | DrinkResult | null
  className?: string
  onLanded?:  () => void   // 착지 완료 콜백
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const CELL_H  = 72
const VISIBLE = 5
const CENTER  = Math.floor(VISIBLE / 2)
const FAST_MS = 45  // 고속 회전 간격

// 감속 스텝 — 카지노 실측 기반, 마지막으로 갈수록 극적으로 느려짐
const DECEL_MS = [55, 85, 125, 175, 240, 320, 420, 540, 680, 850]

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
function topForCenter(order: readonly string[], targetIdx: number): number {
  const len = order.length
  return ((targetIdx - CENTER) % len + len) % len
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
const SlotReel: React.FC<SlotReelProps> = ({
  type, command, result, className = '', onLanded,
}) => {
  const order  = type === 'tip'
    ? (TIP_REEL_ORDER  as readonly string[])
    : (DRINK_REEL_ORDER as readonly string[])
  const labels = type === 'tip' ? TIP_LABELS : DRINK_LABELS

  const [window_, setWindow]    = useState<string[]>(() => buildWindow(order, 0))
  const [revealed, setRevealed] = useState(false)
  const [flash,    setFlash]    = useState(false)
  const [shimmy,   setShimmy]   = useState(false)
  const [glowing,  setGlowing]  = useState(false)

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

  // ── 감속 시퀀스 ───────────────────────────────────────────────────────────
  // 카지노 핵심: 마지막 3-4칸에서 거의 멈출 듯 → 한 칸 더 넘어가는 연출
  const startDecel = useCallback((finalResult: string) => {
    clearAll()
    const finalIdx = (order as string[]).indexOf(finalResult)
    if (finalIdx < 0) return

    const len = order.length

    // 니어미스 시퀀스: 결과 4칸 앞부터 점점 느리게
    // pre4 → pre3 → pre2 → pre1 → final
    // 각 칸마다 딜레이가 극적으로 늘어남 → "이번 칸인가?" 효과
    const pre4 = ((finalIdx - 4 + len) % len)
    const pre3 = ((finalIdx - 3 + len) % len)
    const pre2 = ((finalIdx - 2 + len) % len)
    const pre1 = ((finalIdx - 1 + len) % len)

    type Step =
      | { t: 'snap'; idx: number; delay: number }
      | { t: 'final'; idx: number }

    const seq: Step[] = [
      { t: 'snap',  idx: pre4,     delay: DECEL_MS[3] },  // 175ms
      { t: 'snap',  idx: pre3,     delay: DECEL_MS[5] },  // 320ms — 슬슬 느려짐
      { t: 'snap',  idx: pre2,     delay: DECEL_MS[7] },  // 540ms — 거의 멈출 것 같음
      { t: 'snap',  idx: pre1,     delay: DECEL_MS[9] },  // 850ms — 심장 쫄깃 구간
      { t: 'final', idx: finalIdx },
    ]

    let step = 0
    const runNext = () => {
      if (step >= seq.length) return
      const s = seq[step]

      if (s.t === 'final') {
        snapTo(s.idx)
        // 착지 이펙트
        setRevealed(true)
        setGlowing(true)
        setShimmy(true)
        setTimeout(() => setShimmy(false), 500)
        setFlash(true)
        setTimeout(() => setFlash(false), 350)
        onLanded?.()
        return
      }

      snapTo(s.idx)
      step++
      timerRef.current = setTimeout(runNext, s.delay)
    }

    // 고속 인터벌 중단 후 감속 시작
    timerRef.current = setTimeout(runNext, DECEL_MS[1])
  }, [order, clearAll, snapTo, onLanded])

  // ── Command 처리 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (command === 'idle') {
      clearAll()
      setRevealed(false)
      setFlash(false)
      setGlowing(false)
      topRef.current = 0
      setWindow(buildWindow(order, 0))
      return
    }

    if (command === 'spin') {
      clearAll()
      setRevealed(false)
      setGlowing(false)
      // 고속 회전
      intervalRef.current = setInterval(tick, FAST_MS)
      return
    }

    if (command === 'decel' && result) {
      clearAll()  // 고속 인터벌 즉시 중단
      startDecel(result as string)
      return
    }

    if (command === 'revealed') {
      // 이미 착지 상태 유지 — 아무것도 안 함
      return
    }

    return () => clearAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, result])

  // ── 색상 계산 ─────────────────────────────────────────────────────────────
  const resultColor = result ? colorOf(type, result as string) : '#6b7280'
  const borderColor = glowing ? resultColor : '#374151'

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>

      {/* 헤더 */}
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
        {type === 'tip' ? '💰 TIP' : '🍺 DRINK'}
      </div>

      {/* 릴 윈도우 */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border-2"
        animate={glowing ? {
          boxShadow: [
            `0 0 20px ${resultColor}66`,
            `0 0 45px ${resultColor}cc`,
            `0 0 20px ${resultColor}66`,
          ]
        } : {
          boxShadow: '0 4px 20px #0009<span class="cursor">█</span>