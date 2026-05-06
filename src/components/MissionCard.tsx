// Mission Card flip display
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Mission } from '../types/game'

interface MissionCardProps {
  mission: Mission
  onDone: () => void
}

export default function MissionCard({ mission, onDone }: MissionCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ko' | 'en' | 'vi'

  const text = lang === 'ko' ? mission.text_ko
    : lang === 'en' ? mission.text_en
    : mission.text_vi

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[8500] flex flex-col items-center justify-center bg-black/95"
      onClick={onDone}
    >
      {/* Card flip animation */}
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-80 rounded-3xl border-4 border-[#FFD700] bg-gradient-to-br from-black to-[#1a1200] p-8 text-center"
        style={{
          boxShadow: '0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,140,0,0.2)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 text-2xl">♦️</div>
        <div className="absolute top-3 right-3 text-2xl">♦️</div>
        <div className="absolute bottom-3 left-3 text-2xl">♦️</div>
        <div className="absolute bottom-3 right-3 text-2xl">♦️</div>

        {/* Header */}
        <div
          className="font-bebas text-3xl tracking-widest mb-6"
          style={{ color: '#FFD700', textShadow: '0 0 15px #FFD700' }}
        >
          🎯 미션!
        </div>

        {/* Mission text */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="font-noto font-black text-2xl leading-snug text-white"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
        >
          {text}
        </motion.div>

        {/* Tap to continue */}
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          className="mt-8 text-white/40 text-sm font-noto"
        >
          탭하여 계속
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
