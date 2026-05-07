import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TipResult, DrinkResult,
  TIP_REEL_ORDER, DRINK_REEL_ORDER,
  TIP_LABELS, DRINK_LABELS,
} from '../types/game'

export type ReelCommand = 'idle' | 'spin' | 'decel' | 'revealed'

interface SlotReelProps {
  type:        'tip' | 'drink'
  command:     ReelCommand
  result:      TipResult | DrinkResult | null
  className?:  string
  onLanded?:   () => void
  reelOrder?:  string[]
  escalation?: number
  tierReveal?: string | null
}

const CELL_H  = 72
const VISIBLE = 5
const CENTER  = Math.floor(VISIBLE / 2)
const FAST_MS = 40

// DRINK 감속 — 2.5초 걸쳐 착지
const DRINK_DECEL_STEPS = [
  { delay: 80  },
  { delay: 140 },
  { delay: 240 },
  { delay: 380 },
  { delay: 560 },
  { delay: 800 },
]

// TIP 감속 — 약올리기 최대화, 총 ~6초
// 마지막 2칸에서 1200ms + 2500ms = 3.7초 동안 "올까 말까" 심리전
const TIP_DECEL_STEPS = [
  { delay: 80  },   // pre6 — 빠름
  { delay: 140 },   // pre5
  { delay: 260 },   // pre4 — 슬슬 느려짐
  { delay: 440 },   // pre3 — "이번 칸인가?"
  { delay: 1200 },  // pre2 — 거의 멈춤... 근데 또 넘어감 😱
  { delay: 2500 },  // pre1 — 진짜 멈출 것 같음... 약올리기 절정
]

const ESCALATION_COLORS = [
  'transparent',
  '#fbbf24',
  '#f97316',
  '#ef4444',
  '#dc2626',
]
const ESCALATION_LABELS = [
  '',
  '⚡ 슬슬 터질 것 같은데?',
  '🔥 이번엔 진짜다!!',
  '💥 폭발 직전!!',
  '👑 이번엔 무조건 터진다!!!',
]

// 티어 심볼 매핑 — 금액 대신 심볼로만 표시
function tipToSymbol(key: string): string {
  if (key === 'nothing')  return '💀'
  if (key === 'jackpot')  return '🎉 JACKPOT'
  if (key === 'w200k')    return '🎰 MEGA'
  if (key === 'w100k')    return '🎰 MEGA'
  if (key === 'w50k')     return '🎰 BIG'
  if (key === 'w20k')     return '🎰 MID'
  if (key === 'w10k')     return '🎰 SMALL'
  if (key === 'w5k')      return '🎰 SMALL'
  if (key === 'w2k')      return '🎰 SMALL'
  if (key === 'w1k')      return '🎰 SMALL'
  return '🎰'
}










// 랜덤 회전용 심볼 풀 — 순서 예측 완전 차단
const TIP_SYMBOL_POOL = [
  '💀','🎰 SMALL','🎰 SMALL','🎰 MID','🎰 MID',
  '🎰 BIG','🎰 BIG','🎰 MEGA','🎉 JACKPOT',
]
const DRINK_SYMBOL_POOL = ['🥤','🍺','🍺','🔥','🔥','💥']

function randomSymbol(type: 'tip' | 'drink'): string {
  const pool = type === 'tip' ? TIP_SYMBOL_POOL : DRINK_SYMBOL_POOL
  return pool[Math.floor(Math.random() * pool.length)]
}

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
  }
  const m: Record<string, string> = {
    p25: '#34d399', p50: '#38bdf8',
    p70: '#a78bfa', p100: '#f472b6',
    respin: '#fbbf24',
  }
  return m[key] ?? '#6b7280'
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
  reelOrder,
  escalation = 0, tierReveal = null,
}) => {
  const order  = reelOrder && reelOrder.length > 0
    ? reelOrder
    : type === 'tip'
      ? (TIP_REEL_ORDER  as readonly string[])
      : (DRINK_REEL_ORDER as readonly string[])
  const labels = type === 'tip' ? TIP_LABELS : DRINK_LABELS

  const [window_,  setWindow]   = useState<string[]>(() =>
    Array.from({ length: VISIBLE }, () => randomSymbol(type))
  )
  const [revealed,   setRevealed]   = useState(false)
  const [decelStep,  setDecelStep]  = useState(0)   // 감속 단계 (마지막 2칸 흐림용)
  const [flash,    setFlash]    = useState(false)
  const [shimmy,   setShimmy]   = useState(false)
  const [glowing,  setGlowing]  = useState(false)
  // 약올리기: 중앙 칸이 느리게 멈출 때 화면 테두리 점멸
  const [teasePulse, setTeasePulse] = useState(false)

  const topRef      = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (timerRef.current)    { clearTimeout(timerRef.current);     timerRef.current    = null }
  }, [])

  const tick = useCallback(() => {
    // 고속 회전 중: 완전 랜덤 심볼 표시 — 순서 예측 불가
    setWindow(prev => {
      const next = [...prev.slice(1), randomSymbol(type)]
      return next
    })
  }, [type])

  const snapTo = useCallback((targetIdx: number) => {
    topRef.current = topForCenter(order, targetIdx)
    // 감속 중 앞뒤 칸도 랜덤 심볼 유지 — 중앙만 실제 심볼
    const centerKey = order[targetIdx % order.length]
    setWindow(prev =>
      prev.map((_, i) =>
        i === CENTER ? centerKey : randomSymbol(type)
      )
    )
  }, [order, type])

  const startDecel = useCallback((finalResult: string) => {
    clearAll()
    const finalIdx = (order as string[]).indexOf(finalResult)
    if (finalIdx < 0) return
    const len   = order.length
    const isTip = type === 'tip'
    const steps = isTip ? TIP_DECEL_STEPS : DRINK_DECEL_STEPS
    const total = steps.length  // 6칸 앞에서 시작

    // pre 인덱스 생성 (total칸 앞부터)
    const preIdxs = steps.map((_, i) =>
      ((finalIdx - (total - i) + len) % len)
    )

    let step = 0

    const runNext = () => {
      if (step >= steps.length) {
        // ── 최종 착지 ──
        snapTo(finalIdx)
        setTeasePulse(false)
        setRevealed(true)
        setGlowing(true)
        setShimmy(true)
        setTimeout(() => setShimmy(false), 650)
        setFlash(true)
        setTimeout(() => setFlash(false), 420)
        onLanded?.()
        return
      }

      const s       = steps[step]
      const idx     = preIdxs[step]
      const isLast2 = isTip && step >= steps.length - 2

      snapTo(idx)

      // 마지막 2칸 — 약올리기 테두리 점멸
      if (isLast2) {
        setTeasePulse(true)
        setTimeout(() => setTeasePulse(false), s.delay * 0.6)
        setTimeout(() => setTeasePulse(true),  s.delay * 0.6)
        setTimeout(() => setTeasePulse(false), s.delay * 0.9)
      }

      setDecelStep(step)
      step++
      timerRef.current = setTimeout(runNext, s.delay)
    }

    timerRef.current = setTimeout(runNext, 60)
  }, [order, type, clearAll, snapTo, onLanded])

  useEffect(() => {
    if (command === 'idle') {
      clearAll()
      setRevealed(false)
      setFlash(false)
      setGlowing(false)
      setTeasePulse(false)
      setDecelStep(0)
      topRef.current = 0
      setWindow(Array.from({ length: VISIBLE }, () => randomSymbol(type)))
      return
    }
    if (command === 'spin') {
      clearAll()
      setRevealed(false)
      setGlowing(false)
      setTeasePulse(false)
      setDecelStep(0)
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
  const teaseColor  = '#fbbf24'

  const escColor = ESCALATION_COLORS[Math.min(escalation, 4)]
  const escLabel = ESCALATION_LABELS[Math.min(escalation, 4)]

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>

      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
        {type === 'tip' ? '💰 TIP' : '🍺 DRINK'}
      </div>

      {/* 릴 윈도우 */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border-2"
        animate={
          teasePulse
            ? { boxShadow: [`0 0 0px ${teaseColor}00`, `0 0 50px ${teaseColor}ff`, `0 0 0px ${teaseColor}00`],
                borderColor: [teaseColor, '#fbbf2488', teaseColor] }
            : glowing
            ? { boxShadow: [`0 0 24px ${resultColor}77`, `0 0 55px ${resultColor}dd`, `0 0 24px ${resultColor}77`] }
            : { boxShadow: '0 4px 20px #000a' }
        }
        transition={
          teasePulse
            ? { duration: 0.35, repeat: Infinity }
            : glowing
            ? { duration: 0.65, repeat: Infinity }
            : {}
        }
        style={{
          width: 130,
          height: CELL_H * VISIBLE,
          borderColor: glowing ? resultColor : teasePulse ? teaseColor : '#374151',
          background: '#0d1117',
          transition: 'border-color 0.15s',
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
          animate={
            teasePulse
              ? { borderColor: [teaseColor, `${teaseColor}44`, teaseColor],
                  background:  [`${teaseColor}22`, `${teaseColor}06`, `${teaseColor}22`] }
              : glowing
              ? { borderColor: [resultColor, `${resultColor}33`, resultColor],
                  background:  [`${resultColor}22`, `${resultColor}06`, `${resultColor}22`] }
              : {}
          }
          transition={teasePulse || glowing ? { duration: 0.35, repeat: Infinity } : {}}
          style={{
            top: CENTER * CELL_H + 4,
            height: CELL_H - 8,
            border: `2px solid ${glowing ? resultColor : teasePulse ? teaseColor : '#4b556333'}`,
            margin: '0 4px',
          }}
        />

        {/* 아이템 목록 */}
        <motion.div
          animate={shimmy ? { x: [-9, 9, -7, 7, -5, 5, -3, 3, -1, 1, 0] } : { x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {window_.map((item, i) => {
            const isCenter = i === CENTER
            const iColor   = colorOf(type, item)
            const dist     = Math.abs(i - CENTER)
            const blur     = 0
            const scale    = isCenter && revealed ? 1.15 : 1
            const opacity  = isCenter ? 1 : Math.max(0.55, 1 - dist * 0.15)

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
                    ? `0 0 20px ${iColor}, 0 0 40px ${iColor}99`
                    : 'none',
                  textAlign: 'center',
                  padding: '0 8px',
                  lineHeight: 1.2,
                  userSelect: 'none',
                }}
              >
                {type === 'tip'
                  ? tipToSymbol(item)
                  : (labels[item as keyof typeof labels] ?? item)}
              </div>
            )
          })}
        </motion.div>

        {/* 결과 플래시 */}
        <AnimatePresence>
          {flash && result && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.42 }}
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
            initial={{ scale: 0.2, opacity: 0, y: 12 }}
            animate={{ scale: [0.2, 1.3, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 13 }}
            className="mt-3 px-4 py-1.5 rounded-full text-sm font-extrabold text-black"
            style={{
              background: resultColor,
              boxShadow: `0 0 22px ${resultColor}cc`,
            }}
          >
            {type === 'tip'
              ? tipToSymbol(result as string)
              : (labels[result as keyof typeof labels] ?? result)}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Escalation 긴장 게이지 라벨 */}
      {escalation > 0 && (
        <div
          style={{ color: escColor }}
          className="text-xs font-black text-center mt-1 animate-pulse tracking-tight"
        >
          {escLabel}
        </div>
      )}

      {/* Tier Reveal 심볼 오버레이 */}
      {tierReveal && type === 'tip' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div
            className="text-5xl animate-bounce"
            style={{ filter: 'drop-shadow(0 0 12px gold)' }}
          >
            {tierReveal === 'curse'   ? '💀' :
             tierReveal === 'low'     ? '🎰 SMALL' :
             tierReveal === 'mid'     ? '🎰 MID' :
             tierReveal === 'high'    ? '🎰 BIG' :
             tierReveal === 'jackpot' ? '🎉 JACKPOT' : ''}
          </div>
          <div className="text-xs font-bold text-white mt-1 opacity-80">
            {tierReveal === 'curse'   ? '💀 저주...' :
             tierReveal === 'low'     ? 'SMALL' :
             tierReveal === 'mid'     ? 'MID' :
             tierReveal === 'high'    ? 'BIG' :
             tierReveal === 'jackpot' ? '🎉 JACKPOT!!!' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

export default SlotReel
