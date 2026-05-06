// PWA Install Banner
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

export default function InstallBanner() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-install-dismissed') === '1'
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9400] max-w-md mx-auto"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#FFD700]/30 bg-[#0a0a0a]"
            style={{ boxShadow: '0 0 20px rgba(255,215,0,0.15)' }}
          >
            <span className="text-3xl">🎰</span>
            <div className="flex-1">
              <p className="font-noto font-bold text-white text-sm">{t('installApp')}</p>
              <p className="font-noto text-white/40 text-xs">{t('installDesc')}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-xl bg-[#FFD700] font-bebas text-black text-sm tracking-wider"
            >
              {t('install')}
            </motion.button>
            <button onClick={handleDismiss} className="p-1">
              <X size={14} className="text-white/40" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
