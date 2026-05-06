// Language Selection Screen
import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import type { Language } from '../types/game'

const languages: { code: Language; label: string; flag: string; native: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', native: '한국어' },
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', native: 'Tiếng Việt' },
]

export default function LanguageSelect() {
  const { setLanguage } = useGameStore()

  const handleSelect = (code: Language) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lucky-club-lang', code)
    setLanguage(code)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <div className="text-7xl mb-4">🎰</div>
        <h1
          className="font-bebas text-5xl text-[#FFD700] tracking-widest"
          style={{ textShadow: '0 0 7px #FFD700, 0 0 21px #FFD700, 0 0 42px #FF8C00' }}
        >
          LUCKY CLUB
        </h1>
        <h2
          className="font-bebas text-3xl text-[#FF69B4] tracking-wider mt-1"
          style={{ textShadow: '0 0 7px #FF69B4, 0 0 21px #FF69B4' }}
        >
          MASTER
        </h2>
      </motion.div>

      {/* Language label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-lg mb-8 font-noto"
      >
        언어를 선택하세요 / Select Language / Chọn Ngôn Ngữ
      </motion.p>

      {/* Language buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 200 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(lang.code)}
            className="relative flex items-center gap-4 px-6 py-5 rounded-2xl border-2 border-[#FFD700]/40 bg-white/5 hover:bg-white/10 hover:border-[#FFD700] transition-all duration-200 group"
            style={{
              boxShadow: '0 0 0px transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(255,215,0,0.3)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0px transparent'
            }}
          >
            <span className="text-4xl">{lang.flag}</span>
            <span className="font-bebas text-3xl text-white group-hover:text-[#FFD700] transition-colors tracking-wide">
              {lang.native}
            </span>
            <span className="ml-auto text-white/30 text-xl">›</span>
          </motion.button>
        ))}
      </div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute bottom-8 text-white/20 text-xs font-noto text-center"
      >
        Lucky Club Master v1.0
      </motion.div>
    </div>
  )
}
