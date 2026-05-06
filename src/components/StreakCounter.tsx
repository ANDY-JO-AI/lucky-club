// Streak Counter — bottom-left addiction mechanic
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../store/gameStore'

export default function StreakCounter() {
  const { t } = useTranslation()
  const { consecutiveLow, consecutiveHigh } = useGameStore()

  const showLow = consecutiveLow >= 3
  const showHigh = consecutiveHigh >= 2

  if (!showLow && !showHigh) return null

  return (
    <AnimatePresence>
      <motion.div
        key={showLow ? `low-${consecutiveLow}` : `high-${consecutiveHigh}`}
        initial={{ opacity: 0, scale: 0.7, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.7, x: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="absolute left-4 z-50 pointer-events-none"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="font-noto font-black text-sm px-3 py-1.5 rounded-xl border"
          style={showHigh ? {
            color: '#FFD700',
            borderColor: 'rgba(255,215,0,0.4)',
            background: 'rgba(255,215,0,0.1)',
            textShadow: '0 0 8px #FFD700',
          } : {
            color: '#FF4444',
            borderColor: 'rgba(255,0,0,0.3)',
            background: 'rgba(255,0,0,0.08)',
          }}
        >
          {showHigh
            ? t('highStreak', { count: consecutiveHigh })
            : t('lowStreak', { count: consecutiveLow })
          }
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
