// Player Count Modal with number keypad
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../store/gameStore'
import toast from 'react-hot-toast'

interface PlayerCountModalProps {
  onClose: () => void
}

export default function PlayerCountModal({ onClose }: PlayerCountModalProps) {
  const { t } = useTranslation()
  const { playerCount, setPlayerCount } = useGameStore()
  const [value, setValue] = useState(String(playerCount))

  const handleKey = (k: string) => {
    if (k === 'DEL') { setValue(v => v.slice(0, -1) || ''); return }
    if (k === 'OK') { confirm(); return }
    const next = value + k
    const num = parseInt(next)
    if (!isNaN(num) && num <= 20) setValue(next)
  }

  const confirm = () => {
    const num = parseInt(value)
    if (isNaN(num) || num < 2 || num > 20) {
      toast.error(t('minMax'))
      return
    }
    setPlayerCount(num)
    toast.success(t('playerCountChanged', { count: num }))
    onClose()
  }

  const keys = ['1','2','3','4','5','6','7','8','9','DEL','0','OK']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9600] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full max-w-xs bg-[#0a0a0a] border-2 border-[#FFD700]/30 rounded-3xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-bebas text-2xl text-[#FFD700] tracking-wider text-center mb-2">
          👥 {t('setPlayerCount')}
        </h2>
        <p className="text-white/40 text-xs text-center font-noto mb-4">{t('minMax')}</p>

        {/* Display */}
        <div
          className="text-center font-bebas text-6xl text-[#FFD700] mb-6 h-20 flex items-center justify-center rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/5"
          style={{ textShadow: '0 0 15px #FFD700' }}
        >
          {value || '—'}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map(k => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleKey(k)}
              className={`py-4 rounded-2xl font-bebas text-2xl transition-all ${
                k === 'OK'
                  ? 'bg-[#FFD700] text-black col-span-1'
                  : k === 'DEL'
                  ? 'bg-white/10 text-white/60 border border-white/20'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}
            >
              {k === 'DEL' ? '⌫' : k}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
