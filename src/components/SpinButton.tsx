// Giant SPIN button with breathe animation
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TipResult, DrinkResult } from '../types/game'

type SpinPhase = 'idle' | 'spinning' | 'nearMiss' | 'stopping' | 'tipRevealed' | 'drinkRevealed' | 'celebration' | 'billboard'

interface SpinButtonProps {
  phase: SpinPhase
  onSpin: () => void
  tipResult: TipResult | null
  drinkResult: DrinkResult | null
}

export default function SpinButton({ phase, onSpin, tipResult, drinkResult }: SpinButtonProps) {
  const { t } = useTranslation()
  const isIdle = phase === 'idle'
  const isBillboard = phase === 'billboard'
  const isSpinning = !isIdle && !isBillboard

  const canSpin = isIdle

  return (
    <AnimatePresence mode="wait">
      {canSpin ? (
        <motion.button
          key="spin-btn"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          whileTap={{ scale: 0.92 }}
          onClick={onSpin}
          className="w-full relative overflow-hidden rounded-3xl"
          style={{
            height: '120px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)',
            boxShadow: '0 0 30px #FFD700, 0 0 60px #FF8C00, 0 8px 32px rgba(255,140,0,0.5)',
          }}
        >
          {/* Breathe animation overlay */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              boxShadow: [
                '0 0 20px #FFD700, 0 0 40px #FF8C00',
                '0 0 40px #FFD700, 0 0 80px #FF8C00',
                '0 0 20px #FFD700, 0 0 40px #FF8C00',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />

          <span
            className="font-bebas tracking-widest relative z-10 text-black select-none"
            style={{ fontSize: '54px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            🎰 SPIN!
          </span>
        </motion.button>
      ) : isSpinning ? (
        <motion.div
          key="spinning-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex items-center justify-center rounded-3xl border-2 border-[#FFD700]/30"
          style={{ height: '120px', background: 'rgba(255,215,0,0.05)' }}
        >
          <motion.span
            className="font-bebas text-5xl text-[#FFD700]/50 tracking-widest"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            🎰 ...
          </motion.span>
        </motion.div>
      ) : (
        // Billboard phase — show result summary + spin again button
        <motion.div
          key="result-btn"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col gap-2"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSpin}
            className="w-full rounded-3xl border-2 border-[#FFD700]/60 bg-[#FFD700]/10"
            style={{ height: '80px' }}
          >
            <span className="font-bebas text-4xl text-[#FFD700] tracking-widest">
              🎰 {t('spinAgain')}
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
