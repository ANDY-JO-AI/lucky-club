import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 심볼 정의
const SYMBOLS = [
  { key: 'diamond', emoji: '💎', amount: 500000, weight: 3  },
  { key: 'gold',    emoji: '🥇', amount: 200000, weight: 7  },
  { key: 'silver',  emoji: '🥈', amount: 100000, weight: 12 },
  { key: 'bronze',  emoji: '🥉', amount: 50000,  weight: 18 },
  { key: 'music',   emoji: '🎵', amount: 20000,  weight: 25 },
  { key: 'mic',     emoji: '🎤', amount: 10000,  weight: 35 },
]

// ── 음주 확률 (25% 가장 낮게)
const DRINK_OPTIONS = [
  { label: 'ONE SHOT!! 🍺🍺🍺🍺', value: 'oneshot', color: '#FF4500', weight: 25 },
  { label: '75% 🍺🍺🍺',          value: 'p75',     color: '#FF6B00', weight: 35 },
  { label: '50% 🍺🍺',            value: 'p50',     color: '#FFA500', weight: 30 },
  { label: '25% 🍺',              value: 'p25',     color: '#87CEEB', weight: 10 },
]

function weightedRandom<T extends { weight: number }>(arr: T[]): T {
  const total = arr.reduce((s, x) => s + x.weight, 0)
  let r = Math.random() * total
  for (const x of arr) {
    r -= x.weight
    if (r <= 0) return x
  }
  return arr[arr.length - 1]
}

function randomSymbol(): typeof SYMBOLS[number] {
  return weightedRandom(SYMBOLS)
}

// ── 5×3 그리드 생성
function generateGrid(): typeof SYMBOLS[number][][] {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 5 }, () => randomSymbol())
  )
}

// ── 당첨 판정 (가운데 줄 좌→우 3개 이상 일치)
function checkWin(grid: typeof SYMBOLS[number][][]): { won: boolean; symbol: typeof SYMBOLS[number] | null; count: number } {
  const midRow = grid[1]
  const first = midRow[0]
  let count = 1
  for (let i = 1; i < 5; i++) {
    if (midRow[i].key === first.key) count++
    else break
  }
  if (count >= 3) return { won: true, symbol: first, count }
  return { won: false, symbol: null, count: 0 }
}

type Phase = 'idle' | 'drinking' | 'spinning' | 'result'

export default function CasinoSlot() {
  const [phase, setPhase]           = useState<Phase>('idle')
  const [drinkResult, setDrinkResult] = useState<typeof DRINK_OPTIONS[number] | null>(null)
  const [grid, setGrid]             = useState<typeof SYMBOLS[number][][]>(() => generateGrid())
  const [revealed, setRevealed]     = useState<boolean[][]>(
    Array.from({ length: 3 }, () => Array(5).fill(false))
  )
  const [winResult, setWinResult]   = useState<{ won: boolean; symbol: typeof SYMBOLS[number] | null; count: number } | null>(null)
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false,false,false,false,false])

  // ── SPIN 시작
  const handleSpin = useCallback(() => {
    if (phase !== 'idle') return
    const drink = weightedRandom(DRINK_OPTIONS)
    setDrinkResult(drink)
    setPhase('drinking')
    setWinResult(null)
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))
  }, [phase])

  // ── 음주 완료 → 슬롯 발사
  const handleDrinkDone = useCallback(() => {
    if (phase !== 'drinking') return
    setPhase('spinning')

    const newGrid = generateGrid()
    setGrid(newGrid)
    setSpinningCols([true,true,true,true,true])
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))

    // 1열→2열→3열→4열→5열 순차 정지
    ;[0,1,2,3,4].forEach((col) => {
      setTimeout(() => {
        setSpinningCols(prev => {
          const next = [...prev]
          next[col] = false
          return next
        })
        setRevealed(prev => {
          const next = prev.map(row => [...row])
          for (let r = 0; r < 3; r++) next[r][col] = true
          return next
        })
        // 마지막 열 정지 후 결과 판정
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
    setPhase('idle')
    setDrinkResult(null)
    setWinResult(null)
    setGrid(generateGrid())
    setRevealed(Array.from({ length: 3 }, () => Array(5).fill(false)))
    setSpinningCols([false,false,false,false,false])
  }, [])

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black px-4 pt-6 pb-10 select-none">

      {/* 타이틀 */}
      <div className="font-bebas text-3xl text-[#FFD700] tracking-widest mb-6"
        style={{ textShadow: '0 0 16px #FFD700' }}>
        🎰 CASINO SLOT
      </div>

      {/* 5×3 슬롯 그리드 */}
      <div className="w-full max-w-sm mb-6">
        {/* 페이라인 표시 */}
        <div className="flex justify-center mb-2">
          <span className="text-xs text-[#FFD700]/60 font-bold tracking-widest">
            ── 가운데 줄 3개 이상 일치 시 당첨 ──
          </span>
        </div>

        <div className="relative rounded-2xl border-2 border-[#374151] bg-[#0d1117] p-3"
          style={{ boxShadow: '0 0 30px #FFD70022' }}>

          {/* 가운데 줄 하이라이트 */}
          <div className="absolute left-3 right-3 rounded-lg border-2 border-[#FFD700]/40 pointer-events-none z-10"
            style={{ top: 'calc(33.33% + 4px)', height: 'calc(33.33% - 8px)', background: '#FFD70008' }}
          />

          {/* 그리드 */}
          {grid.map((row, r) => (
            <div key={r} className="flex gap-2 mb-2 last:mb-0">
              {row.map((sym, c) => {
                const isCenter = r === 1
                const isRev    = revealed[r][c]
                const isSpin   = spinningCols[c]

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    className="flex-1 flex items-center justify-center rounded-xl border"
                    style={{
                      height: 64,
                      background: isCenter && isRev
                        ? '#FFD70015'
                        : '#111827',
                      borderColor: isCenter && isRev
                        ? '#FFD700aa'
                        : '#1f2937',
                      fontSize: isCenter ? 28 : 22,
                      opacity: isRev ? 1 : isSpin ? 0.3 : 0.25,
                    }}
                    animate={isSpin
                      ? { y: [-4, 4, -4], opacity: [0.3, 0.5, 0.3] }
                      : isRev
                        ? { scale: [0.8, 1.15, 1], opacity: 1 }
                        : {}
                    }
                    transition={isSpin
                      ? { duration: 0.18, repeat: Infinity }
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

      {/* 음주 결과 표시 */}
      <AnimatePresence>
        {drinkResult && phase !== 'idle' && (
          <motion.div
            key="drink"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 px-6 py-3 rounded-2xl border-2 text-center"
            style={{
              borderColor: drinkResult.color,
              background: `${drinkResult.color}18`,
              boxShadow: `0 0 20px ${drinkResult.color}44`,
            }}
          >
            <div className="font-bebas text-3xl" style={{ color: drinkResult.color }}>
              {drinkResult.label}
            </div>
            <div className="font-noto text-white/60 text-xs mt-1">마셔야 합니다!</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 당첨 결과 */}
      <AnimatePresence>
        {phase === 'result' && winResult && (
          <motion.div
            key="result"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className="mb-6 px-8 py-4 rounded-2xl border-2 text-center w-full max-w-sm"
            style={{
              borderColor: winResult.won ? '#FFD700' : '#374151',
              background: winResult.won ? '#FFD70015' : '#111',
              boxShadow: winResult.won ? '0 0 40px #FFD70066' : 'none',
            }}
          >
            {winResult.won ? (
              <>
                <div className="font-bebas text-5xl text-[#FFD700]"
                  style={{ textShadow: '0 0 20px #FFD700' }}>
                  {winResult.count === 5 ? '🏆 JACKPOT!' : '🎉 당첨!'}
                </div>
                <div className="font-bebas text-3xl text-white mt-1">
                  {winResult.symbol?.emoji} {winResult.count}개 일치
                </div>
                <div className="font-bebas text-4xl mt-2"
                  style={{ color: '#FFD700', textShadow: '0 0 12px #FFD700' }}>
                  {winResult.symbol?.amount.toLocaleString()}₫
                </div>
              </>
            ) : (
              <>
                <div className="font-bebas text-4xl text-white/50">😅 아쉽네요!</div>
                <div className="font-noto text-white/30 text-sm mt-1">다음엔 꼭 당첨!</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 버튼 영역 */}
      <div className="w-full max-w-sm flex flex-col gap-3">

        {/* SPIN 버튼 */}
        {phase === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest text-black"
            style={{ background: '#FFD700', boxShadow: '0 0 24px #FFD70066' }}
          >
            🎰 SPIN
          </motion.button>
        )}

        {/* 다 마셨어요 버튼 */}
        {phase === 'drinking' && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDrinkDone}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest border-2"
            style={{
              borderColor: drinkResult?.color,
              color: drinkResult?.color,
              background: `${drinkResult?.color}18`,
              boxShadow: `0 0 20px ${drinkResult?.color}44`,
            }}
          >
            다 마셨어요 🍺
          </motion.button>
        )}

        {/* 한 번 더 버튼 */}
        {phase === 'result' && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest border-2 border-[#FFD700]/60 text-[#FFD700]"
            style={{ background: '#FFD70010', boxShadow: '0 0 16px #FFD70033' }}
          >
            🎰 한 번 더?
          </motion.button>
        )}
      </div>
    </div>
  )
}
