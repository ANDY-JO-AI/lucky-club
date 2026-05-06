// Top navigation bar
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Settings, Volume2, VolumeX, Edit3 } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

interface TopBarProps {
  onSettingsOpen: () => void
  onPlayerCountEdit: () => void
}

export default function TopBar({ onSettingsOpen, onPlayerCountEdit }: TopBarProps) {
  const { t } = useTranslation()
  const { category, playerCount, isMuted, setMuted, jackpotCount } = useGameStore()

  const categoryBadge = {
    beer: '🍺',
    karaoke: '🎤',
    adult: '🔞',
  }[category]

  const categoryName = {
    beer: 'BEER CLUB',
    karaoke: 'KARAOKE',
    adult: 'ADULT',
  }[category]

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1 z-10">
      {/* Left: category badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{categoryBadge}</span>
        <span
          className="font-bebas text-lg tracking-wider text-[#FFD700]"
          style={{ textShadow: '0 0 7px #FFD700' }}
        >
          {categoryName}
        </span>
      </div>

      {/* Center: jackpot count mini badge */}
      {jackpotCount > 0 && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-noto text-[10px] font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-2 py-0.5"
        >
          💥 {jackpotCount}
        </motion.div>
      )}

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Player count edit — karaoke / adult only */}
        {(category === 'karaoke' || category === 'adult') && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPlayerCountEdit}
            className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5"
          >
            <Edit3 size={13} className="text-white/70" />
            <span className="font-noto text-xs text-white/80 font-bold">{playerCount}명</span>
          </motion.button>
        )}

        {/* Mute toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMuted(!isMuted)}
          className="p-2 rounded-lg bg-white/10 border border-white/20"
        >
          {isMuted
            ? <VolumeX size={16} className="text-white/50" />
            : <Volume2 size={16} className="text-[#FFD700]" />
          }
        </motion.button>

        {/* Settings */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSettingsOpen}
          className="p-2 rounded-lg bg-white/10 border border-white/20"
        >
          <Settings size={16} className="text-white/70" />
        </motion.button>
      </div>
    </div>
  )
}
