import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// ── 심볼 정의
const SYMBOLS = [
  { key: 'diamond', emoji: '💎', amount: 500000, weight: 3,  color: '#FFD700' },
  { key: 'gold',    emoji: '🥇', amount: 200000, weight: 7,  color: '#FFA500' },
  { key: 'silver',  emoji: '🥈', amount: 100000, weight: 12, color: '#C0C0C0' },
  { key: 'bronze',  emoji: '🥉', amount: 50000,  weight: 18, color: '#CD7F32' },
  { key: 'music',   emoji: '🎵', amount: 20000,  weight: 25, color: '#38bdf8' },
  { key: 'mic',     emoji: '🎤', amount: 10000,  weight: 35, color: '#a78bfa' },
] as const

type SymbolKey = typeof SYMBOLS[number]['key']
type Symbol = typeof SYMBOLS[number]

// ── 음주량 옵션 (25% 확률 가장 낮게)
const DRINK_OPTIONS = [
  { key: 'oneshot', weight: 25, fill: 100, color: '#FF4500',
    label: { ko: 'ONE SHOT!! 🍺🍺🍺🍺', en: 'ONE SHOT!! 🍺🍺🍺🍺', vi: 'UỐNG CẠN!! 🍺🍺🍺🍺' } },
  { key: 'p75',     weight: 35, fill: 75,  color: '#FF6B00',
    label: { ko: '75% 🍺🍺🍺', en: '75% 🍺🍺🍺', vi: '75% 🍺🍺🍺' } },
  { key: 'p50',     weight: 30, fill: 50,  color: '#FFA500',
    label: { ko: '50% 🍺🍺', en: '50% 🍺🍺', vi: '50% 🍺🍺' } },
  { key: 'p25',     weight: 10, fill: 25,  color: '#87CEEB',
    label: { ko: '25% 🍺', en: '25% 🍺', vi: '25% 🍺' } },
] as const

type DrinkOption = typeof DRINK_OPTIONS[number]
type Lang = 'ko' | 'en' | 'vi'

// ── 페이테이블 텍스트
const PAY_LABELS: Record<SymbolKey, Record<Lang, string>> = {
  diamond: { ko: '잭팟!',  en: 'JACKPOT!',   vi: 'JACKPOT!'     },
  gold:    { ko: '대박!',  en: 'MEGA WIN!',   vi: 'THẮNG LỚN!'  },
  silver:  { ko: '고액!',  en: 'BIG WIN!',    vi: 'THẮNG TO!'   },
  bronze:  { ko: '중액',   en: 'MID WIN',     vi: 'THẮNG VỪA'   },
  music:   { ko: '소액',   en: 'SMALL WIN',   vi: 'THẮNG NHỎ'   },
  mic:     { ko: '참가상', en: 'BONUS',        vi: 'THƯỞNG'      },
}

// ── 참여조건 텍스트
const TOKEN_MSG: Record<Lang, string> = {
  ko: '🍺 게임 참여권 — 먼저 마셔야 SPIN 가능!',
  en: '🍺 Game Token — Drink first to SPIN!',
  vi: '🍺 Vé tham gia — Uống xong mới SPIN được!',
}
const DRAWING_MSG: Record<Lang, string> = {
  ko: '🍺 참여권 뽑는 중...',
  en: '🍺 Drawing your token...',
  vi: '🍺 Đang rút vé...',
}
const DRINK_PROMPT: Record<Lang, (label: string) => string> = {
  ko: (l) => `${l} 마셔야 SPIN 가능!`,
  en: (l) => `Drink ${l} to SPIN!`,
  vi: (l) => `Uống ${l} để SPIN!`,
}
const DONE_BTN: Record<Lang, string> = {
  ko: '다 마셨어요! 🎰 SPIN',
  en: 'Done Drinking! 🎰 SPIN',
  vi: 'Uống xong rồi! 🎰 SPIN',
}
const SPIN_BTN: Record<Lang, string> = {
  ko: '🎰 SPIN',
  en: '🎰 SPIN',
  vi: '🎰 SPIN',
}
const AGAIN_BTN: Record<Lang, string> = {
  ko: '🎰 한 번 더?',
  en: '🎰 One More?',
  vi: '🎰 Chơi lại?',
}
const WIN_MSG: Record<Lang, string> = {
  ko: '🎉 당첨!',
  en: '🎉 YOU WIN!',
  vi: '🎉 THẮNG RỒI!',
}
const JACKPOT_MSG: Record<Lang, string> = {
  ko: '🏆 JACKPOT!!!',
  en: '🏆 JACKPOT!!!',
  vi: '🏆 JACKPOT!!!',
}
const LOSE_MSG: Record<Lang, string> = {
  ko: '😅 아쉽네요! 다음엔 꼭!',
  en: '😅 So close! Next time!',
  vi: '😅 Tiếc quá! Lần sau nhé!',
}
const PAYTABLE_TITLE: Record<Lang, string> = {
  ko: '💰 당첨 금액표',
  en: '💰 Pay Table',
  vi: '💰 Bảng Thưởng',
}
const MATCH_MSG: Record<Lang, string> = {
  ko: '가운데 줄 3개 이상 일치 시 당첨',
  en: 'Match 3+ in the middle row to win',
  vi: 'Trùng 3+ ở hàng giữa để thắng',
}

// ── 유틸
function weightedRandom<T extends { weight: number }>(arr: readonly T[]): T {
  const total = arr.reduce((s, x) => s + x.weight, 0)
  let r = Math.random() * total
  for (const x of arr) { r -= x.weight; if (r <= 0) return x }
  return arr[arr.length - 1]
}

function randomSymbol(): Symbol {
  return weightedRandom(SYMBOLS) as Symbol
}

function generateGrid(): Symbol[][] {
  return Array.from({ length: 3 }, () => Array.from({ length: 5 }, randomSymbol))
}

function checkWin(grid: Symbol[][]): { won: boolean; symbol: Symbol | null; count: number } {
  const mid = grid[1]
  const first = mid[0]
  let count = 1
  for (let i = 1; i < 5; i++) {
    if (mid[i].key === first.key) count++
    else break
  }
  if (count >= 3) return { won: true, symbol: first, count }
  return { won: false, symbol: null, count: 0 }
}

// ── 음주 릴 심볼 풀
const DRINK_REEL = ['🍺', '🍺🍺', '🍺🍺🍺', '🍺🍺🍺🍺', '🥂', '🍻']

type Phase = 'idle' | 'drawingDrink' | 'drinkRevealed' | 'spinning' | 'result'

export default function CasinoSlot() {
  const { i18n } = useTranslation()
  const lang = (i18n.language?.slice(0,2) as Lang) || 'ko'
  const L = (obj: Record<Lang, string>) => obj[lang] ?? obj['ko']

  const [phase, setPhase]             = useState<Phase>('idle')
  const [drinkResult, setDrinkResult] = useState<DrinkOption | null>(null)
  const [drinkReel, setDrinkReel]     = useState('🍺')
  const [grid, setGrid]               = useState<Symbol[][]>(generateGrid)
  const [revealed, setRevealed]       = useState<boolean[][]>(
    Array.from({ length: 3 }, () => Array(5).fill(false))
  )
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false,false,false,false,false])
  const [winResult, setWinResult]     = useState<{ won: boolean; symbol: Symbol | null; count: number } | null>(null)
  const [glassFill, setGlassFill]     = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── SPIN 클릭 → 음주 릴 돌리기
  const handleSpin = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('drawingDrink')
    setWinResult(null)
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))
    setGlassFill(0)

    // 음주 릴 고속 회전
    let tick = 0
    intervalRef.current = setInterval(() => {
      setDrinkReel(DRINK_REEL[tick % DRINK_REEL.length])
      tick++
    }, 80)

    // 1.5초 후 결과 결정 + 감속
    setTimeout(() => {
      const result = weightedRandom(DRINK_OPTIONS) as DrinkOption
      setDrinkResult(result)

      // 감속 후 착지
      let speed = 80
      let slowTick = 0
      const slowDown = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        speed = Math.min(speed + 120, 600)
        slowTick++
        setDrinkReel(result.label[lang])
        if (slowTick < 4) {
          setDrinkReel(DRINK_REEL[slowTick % DRINK_REEL.length])
          intervalRef.current = setTimeout(slowDown, speed)
        } else {
          setDrinkReel(result.label[lang])
          setTimeout(() => {
            setPhase('drinkRevealed')
            // 유리잔 채우기 애니메이션
            let fill = 0
            const fillInterval = setInterval(() => {
              fill += 5
              setGlassFill(fill)
              if (fill >= result.fill) clearInterval(fillInterval)
            }, 30)
          }, 300)
        }
      }
      slowDown()
    }, 1500)
  }, [phase, lang])

  // ── 음주 완료 → 슬롯 발사
  const handleDrinkDone = useCallback(() => {
    if (phase !== 'drinkRevealed') return
    setPhase('spinning')
    const newGrid = generateGrid()
    setGrid(newGrid)
    setSpinningCols([true,true,true,true,true])
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))

    ;[0,1,2,3,4].forEach((col) => {
      setTimeout(() => {
        setSpinningCols(prev => { const n = [...prev]; n[col] = false; return n })
        setRevealed(prev => {
          const n = prev.map(r => [...r])
          for (let r = 0; r < 3; r++) n[r][col] = true
          return n
        })
        if (col === 4) {
          setTimeout(() => {
            const result = checkWin(newGrid)
            setWinResult(result)
            setPhase('result')
          }, 400)
        }
      }, 800 + col * 600)
    })
  }, [phase])

  // ── 리셋
  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('idle')
    setDrinkResult(null)
    setDrinkReel('🍺')
    setWinResult(null)
    setGrid(generateGrid())
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))
    setSpinningCols([false,false,false,false,false])
    setGlassFill(0)
  }, [])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return (
    <div className="flex flex-col items-center w-full bg-black px-4 pt-4 pb-10 select-none overflow-y-auto">

      {/* 타이틀 */}
      <motion.div
        className="font-bebas text-3xl text-[#FFD700] tracking-widest mb-2"
        animate={{ textShadow: ['0 0 10px #FFD700', '0 0 30px #FFD700', '0 0 10px #FFD700'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🎰 CASINO SLOT
      </motion.div>

      {/* 참여조건 안내 */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 px-4 py-2 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/5 text-center"
        >
          <p className="text-[#FFD700] text-xs font-bold">{L(TOKEN_MSG)}</p>
        </motion.div>
      )}

      {/* 음주 릴 */}
      <div className="w-full max-w-sm mb-4">
        <div className="rounded-2xl border-2 bg-[#0d1117] p-4 flex flex-col items-center"
          style={{
            borderColor: drinkResult ? drinkResult.color : '#374151',
            boxShadow: drinkResult ? `0 0 20px ${drinkResult.color}44` : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {/* 뽑는 중 메시지 */}
          {phase === 'drawingDrink' && (
            <p className="text-white/50 text-xs mb-2 font-bold tracking-widest animate-pulse">
              {L(DRAWING_MSG)}
            </p>
          )}

          {/* 음주 릴 심볼 */}
          <motion.div
            className="font-bebas text-4xl text-center min-h-[48px] flex items-center justify-center"
            animate={phase === 'drawingDrink' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.16, repeat: phase === 'drawingDrink' ? Infinity : 0 }}
            style={{ color: drinkResult ? drinkResult.color : '#FFD700',
                     textShadow: drinkResult ? `0 0 16px ${drinkResult.color}` : 'none' }}
          >
            {phase === 'idle' ? '🍺 ?' : drinkReel}
          </motion.div>

          {/* 결과 확정 후 — 유리잔 + 프롬프트 */}
          <AnimatePresence>
            {(phase === 'drinkRevealed' || phase === 'spinning' || phase === 'result') && drinkResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 mt-3 w-full"
              >
                {/* 유리잔 */}
                <div className="relative w-12 h-16 border-2 border-white/30 rounded-b-xl overflow-hidden bg-black/50">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    initial={{ height: 0 }}
                    animate={{ height: `${glassFill}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ background: drinkResult.color, opacity: 0.85 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bebas text-sm">{drinkResult.fill}%</span>
                  </div>
                </div>
                <p className="font-bebas text-lg text-center"
                   style={{ color: drinkResult.color }}>
                  {L(DRINK_PROMPT)(drinkResult.label[lang])}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 5×3 슬롯 그리드 */}
      <div className="w-full max-w-sm mb-4">
        <p className="text-center text-[#FFD700]/50 text-xs font-bold mb-2 tracking-widest">
          {L(MATCH_MSG)}
        </p>
        <div className="relative rounded-2xl border-2 border-[#374151] bg-[#0d1117] p-3"
          style={{ boxShadow: '0 0 30px #FFD70011' }}>
          {/* 가운데 줄 하이라이트 */}
          <div className="absolute left-3 right-3 rounded-lg border border-[#FFD700]/30 pointer-events-none z-10"
            style={{ top: 'calc(33.33% + 4px)', height: 'calc(33.33% - 8px)', background: '#FFD70008' }} />

          {grid.map((row, r) => (
            <div key={r} className="flex gap-2 mb-2 last:mb-0">
              {row.map((sym, c) => {
                const isCenter = r === 1
                const isRev    = revealed[r][c]
                const isSpin   = spinningCols[c]
                return (
                  <motion.div
                    key={`${r}-${c}-${sym.key}`}
                    className="flex-1 flex items-center justify-center rounded-xl border"
                    style={{
                      height: 60,
                      background: isCenter && isRev ? `${sym.color}18` : '#111827',
                      borderColor: isCenter && isRev ? `${sym.color}aa` : '#1f2937',
                      fontSize: isCenter ? 26 : 20,
                      opacity: isRev ? 1 : isSpin ? 0.4 : 0.2,
                    }}
                    animate={isSpin
                      ? { y: [-3, 3, -3], opacity: [0.3, 0.5, 0.3] }
                      : isRev ? { scale: [0.8, 1.15, 1] } : {}
                    }
                    transition={isSpin
                      ? { duration: 0.15, repeat: Infinity }
                      : { type: 'spring', stiffness: 300, damping: 14 }
                    }
                  >
                    {isSpin ? '🎰' : sym.emoji}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 당첨 결과 */}
      <AnimatePresence>
        {phase === 'result' && winResult && (
          <motion.div
            key="result"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 1], opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className="w-full max-w-sm mb-4 px-6 py-4 rounded-2xl border-2 text-center"
            style={{
              borderColor: winResult.won ? (winResult.symbol?.color ?? '#FFD700') : '#374151',
              background:  winResult.won ? `${winResult.symbol?.color ?? '#FFD700'}15` : '#111',
              boxShadow:   winResult.won ? `0 0 40px ${winResult.symbol?.color ?? '#FFD700'}55` : 'none',
            }}
          >
            {winResult.won ? (
              <>
                <div className="font-bebas text-4xl"
                  style={{ color: winResult.symbol?.color, textShadow: `0 0 20px ${winResult.symbol?.color}` }}>
                  {winResult.count === 5 ? L(JACKPOT_MSG) : L(WIN_MSG)}
                </div>
                <div className="font-bebas text-2xl text-white mt-1">
                  {winResult.symbol?.emoji} {winResult.count}개 일치
                </div>
                <div className="font-bebas text-4xl mt-1"
                  style={{ color: '#FFD700', textShadow: '0 0 12px #FFD700' }}>
                  {winResult.symbol?.amount.toLocaleString()}₫
                </div>
              </>
            ) : (
              <>
                <div className="font-bebas text-3xl text-white/50">{L(LOSE_MSG)}</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 버튼 */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {phase === 'idle' && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSpin}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest text-black"
            style={{ background: '#FFD700', boxShadow: '0 0 24px #FFD70066' }}>
            {L(SPIN_BTN)}
          </motion.button>
        )}
        {phase === 'drinkRevealed' && drinkResult && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }} onClick={handleDrinkDone}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest border-2"
            style={{ borderColor: drinkResult.color, color: drinkResult.color,
                     background: `${drinkResult.color}18`, boxShadow: `0 0 20px ${drinkResult.color}44` }}>
            {L(DONE_BTN)}
          </motion.button>
        )}
        {phase === 'result' && (
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }} whileTap={{ scale: 0.95 }} onClick={handleReset}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest border-2 border-[#FFD700]/60 text-[#FFD700]"
            style={{ background: '#FFD70010', boxShadow: '0 0 16px #FFD70033' }}>
            {L(AGAIN_BTN)}
          </motion.button>
        )}
      </div>

      {/* 페이테이블 */}
      <div className="w-full max-w-sm rounded-2xl border border-[#374151] bg-[#0d1117] p-4">
        <p className="font-bebas text-lg text-center text-[#FFD700] mb-3 tracking-widest">
          {L(PAYTABLE_TITLE)}
        </p>
        <div className="flex flex-col gap-2">
          {SYMBOLS.map((sym) => {
            const isJackpot = sym.key === 'diamond'
            return (
              <motion.div
                key={sym.key}
                className="flex items-center justify-between px-3 py-2 rounded-xl border"
                style={{
                  borderColor: isJackpot ? sym.color : `${sym.color}44`,
                  background:  isJackpot ? `${sym.color}18` : `${sym.color}08`,
                }}
                animate={isJackpot
                  ? { boxShadow: [`0 0 8px ${sym.color}44`, `0 0 20px ${sym.color}aa`, `0 0 8px ${sym.color}44`] }
                  : {}
                }
                transition={isJackpot ? { duration: 1, repeat: Infinity } : {}}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 22 }}>{sym.emoji}</span>
                  <span className="font-bebas text-sm" style={{ color: sym.color }}>
                    {PAY_LABELS[sym.key][lang]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isJackpot && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="text-xs">👑</motion.span>
                  )}
                  <span className="font-bebas text-base" style={{ color: sym.color }}>
                    {sym.amount.toLocaleString()}₫
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
