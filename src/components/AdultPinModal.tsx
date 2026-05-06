// Adult Mode PIN entry modal
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface AdultPinModalProps {
  correctPin: string
  onSuccess: () => void
  onCancel: () => void
}

export default function AdultPinModal({ correctPin, onSuccess, onCancel }: AdultPinModalProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleKey = (k: string) => {
    if (k === 'DEL') { setValue(v => v.slice(0, -1)); setError(false); return }
    if (value.length >= 4) return
    const next = value + k
    setValue(next)
    if (next.length === 4) {
      if (next === correctPin) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => { setValue(''); setError(false) }, 600)
      }
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','DEL','0','✕']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9700] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={error ? { x: [-8, 8, -8, 8, 0] } : { scale: 1, opacity: 1 }}
        transition={error ? { duration: 0.3 } : { type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full max-w-xs bg-[#0a0a0a] border-2 rounded-3xl p-6"
        style={{ borderColor: error ? '#FF0000' : 'rgba(255,105,180,0.4)' }}
      >
        <div className="text-center text-4xl mb-2">🔞</div>
        <h2 className="font-bebas text-2xl text-[#FF69B4] tracking-wider text-center mb-1">
          {t('adultPinTitle')}
        </h2>
        <p className="text-white/40 text-xs text-center font-noto mb-6">{t('adultPinDesc')}</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              animate={value.length > i ? { scale: [0, 1.3, 1] } : {}}
              transition={{ type: 'spring', stiffness: 500 }}
              className="w-5 h-5 rounded-full border-2"
              style={{
                borderColor: error ? '#FF0000' : '#FF69B4',
                background: value.length > i
                  ? (error ? '#FF0000' : '#FF69B4')
                  : 'transparent',
                boxShadow: value.length > i
                  ? (error ? '0 0 8px #FF0000' : '0 0 8px #FF69B4')
                  : 'none',
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-[#FF0000] text-center text-sm font-noto font-bold mb-3">
            {t('adultPinError')}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map(k => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.9 }}
              onClick={() => k === '✕' ? onCancel() : handleKey(k)}
              className={`py-4 rounded-2xl font-bebas text-2xl transition-all ${
                k === '✕'
                  ? 'bg-white/10 text-white/40 border border-white/10'
                  : k === 'DEL'
                  ? 'bg-white/10 text-white/60 border border-white/20'
                  : 'bg-white/10 text-white border border-white/10'
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
