// Settings Modal
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { setMasterVolume, setMuted } from '../lib/sounds'
import i18n from '../i18n'
import type { Language } from '../types/game'

interface SettingsModalProps {
  onClose: () => void
}

const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
]

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { isMuted, volume, setMuted: storeSetMuted, setVolume, language, setLanguage } = useGameStore()

  const handleVolumeChange = (v: number) => {
    setVolume(v)
    setMasterVolume(v)
  }

  const handleMute = () => {
    storeSetMuted(!isMuted)
    setMuted(!isMuted)
  }

  const handleLang = (code: Language) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lucky-club-lang', code)
    setLanguage(code)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9500] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-[#0a0a0a] border-t-2 border-[#FFD700]/30 rounded-t-3xl px-6 pt-4 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bebas text-2xl text-[#FFD700] tracking-wider">{t('settings')}</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Sound section */}
        <section className="mb-6">
          <h3 className="font-noto font-bold text-white/50 text-xs uppercase tracking-widest mb-3">
            {t('soundSettings')}
          </h3>
          <div className="flex flex-col gap-4">
            {/* Mute toggle */}
            <div className="flex items-center justify-between">
              <span className="font-noto text-white font-bold">{isMuted ? t('unmute') : t('mute')}</span>
              <button
                onClick={handleMute}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${isMuted ? 'bg-white/20' : 'bg-[#FFD700]'}`}
              >
                <motion.div
                  animate={{ x: isMuted ? 0 : 28 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-black rounded-full"
                />
              </button>
            </div>

            {/* Volume slider */}
            {!isMuted && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="font-noto text-white font-bold">{t('masterVolume')}</span>
                  <span className="font-bebas text-[#FFD700]">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-[#FFD700]"
                  style={{ height: 4 }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Language section */}
        <section className="mb-6">
          <h3 className="font-noto font-bold text-white/50 text-xs uppercase tracking-widest mb-3">
            {t('language')}
          </h3>
          <div className="flex gap-2">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => handleLang(l.code)}
                className={`flex-1 py-2.5 rounded-xl border font-noto font-bold text-sm transition-all ${
                  language === l.code
                    ? 'border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700]'
                    : 'border-white/20 bg-white/5 text-white/60'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Admin link */}
        <section>
          <a
            href="/admin"
            className="block text-center py-3 rounded-xl border border-white/20 bg-white/5 font-noto font-bold text-white/50 text-sm"
          >
            ⚙️ {t('adminLogin')}
          </a>
        </section>
      </motion.div>
    </motion.div>
  )
}
