// Full-screen Billboard result display
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TipResult, DrinkResult, TIP_VALUES, getTipTier } from '../types/game'
import { useGameStore } from '../store/gameStore'

interface BillboardProps {
  tipResult:        TipResult
  drinkResult:      DrinkResult
  onDismiss:        () => void
  onJackpotDismiss: () => void
  onSpinAgain?:     () => void
}

export default function Billboard({
  tipResult, drinkResult, onDismiss, onJackpotDismiss, onSpinAgain,
}: BillboardProps) {
  const { t }   = useTranslation()
  const store   = useGameStore()
  const config  = store.config
  const tier    = getTipTier(tipResult)
  const amount  = TIP_VALUES[tipResult]
  const isJackpot  = tier === 'jackpot'
  const isCurse    = tier === 'curse'
  const isHigh     = tier === 'high'

  // forcedShot 로직: jackpotForcedShot 또는 TIP별 forcedShot ON이면 100% 원샷 강제
  const isForcedShot =
    (isJackpot && config.jackpotForcedShot) ||
    (config.forcedShot?.[tipResult] ?? false)

  // forcedShot이면 drinkResult 표시를 p100으로 강제
  const displayDrink: DrinkResult = isForcedShot ? 'p100' : drinkResult

  const bgColor = (() => {
    if (isJackpot) return '#000'
    if (isCurse)   return '#1a0000'
    if (isHigh)    return '#0a0800'
    if (tier === 'mid-high') return '#0a0800'
    return '#050505'
  })()

  const mainColor = (() => {
    if (isJackpot) return '#FFD700'
    if (isCurse)   return '#FF0000'
    if (isHigh)    return '#FFD700'
    if (tier === 'mid-high') return '#FFD700'
    if (tier === 'mid')      return '#C0C0C0'
    return '#FFFFFF'
  })()

  const drinkColor = (() => {
    switch (displayDrink) {
      case 'p100':   return '#FF4500'
      case 'p70':    return '#FF6B00'
      case 'p50':    return '#FFA500'
      case 'p25':    return '#87CEEB'
      case 'respin': return '#39FF14'
      default:       return '#FFFFFF'
    }
  })()

  const formatAmount = (n: number) =>
    n === 0 ? t('nothing') : `${n.toLocaleString()}₫`

  // 언어별 drink 라벨 (i18n 사용)
  const drinkLabel = (() => {
    switch (displayDrink) {
      case 'p25':    return t('p25')
      case 'p50':    return t('p50')
      case 'p70':    return t('p70')
      case 'p100':   return t('p100')
      case 'respin': return t('respin')
      default:       return ''
    }
  })()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center"
      style={{ background: bgColor }}
      onClick={isJackpot ? undefined : onDismiss}
    >
      {/* 잭팟 플래시 */}
      {isJackpot && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ backgroundColor: ['#000','#FFD700','#000','#FFD700','#000'] }}
          transition={{ duration: 1.0, times: [0, 0.1, 0.2, 0.3, 0.4] }}
        />
      )}

      {/* 고액 네온 테두리 */}
      {(isHigh || isJackpot) && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ boxShadow: [
            `inset 0 0 40px ${mainColor}60`,
            `inset 0 0 80px ${mainColor}90`,
            `inset 0 0 40px ${mainColor}60`,
          ]}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {/* p100 불꽃 테두리 */}
      {displayDrink === 'p100' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ boxShadow: [
            'inset 0 0 30px rgba(255,69,0,0.6)',
            'inset 0 0 60px rgba(255,140,0,0.9)',
            'inset 0 0 30px rgba(255,69,0,0.6)',
          ]}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}

      <div className="flex flex-col items-center gap-6 px-6 text-center relative z-10">

        {/* ── JACKPOT ── */}
        {isJackpot ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="font-bebas tracking-widest"
              style={{
                fontSize: 'clamp(60px, 18vw, 90px)',
                color: '#FFD700',
                textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 80px #FF8C00',
              }}
            >
              {t('jackpot')}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-bebas"
              style={{
                fontSize: 'clamp(40px, 12vw, 60px)',
                color: '#FFD700',
                textShadow: '0 0 15px #FFD700',
              }}
            >
              {t('jackpotAmount')}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.2, 1] }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="font-bebas text-4xl"
              style={{ color: '#FF4500', textShadow: '0 0 15px #FF4500' }}
            >
              {t('jackpotShot')}
            </motion.div>

            <DrinkDisplay drinkResult={displayDrink} drinkColor={drinkColor} drinkLabel={drinkLabel} />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onJackpotDismiss}
              className="mt-4 px-8 py-3 rounded-2xl border-2 border-[#FFD700] bg-[#FFD700]/20 font-bebas text-2xl text-[#FFD700] tracking-widest"
            >
              {t('cancel') === 'cancel' ? '닫기' : t('cancel')}
            </motion.button>
          </>

        /* ── CURSE ── */
        ) : isCurse ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="font-bebas"
              style={{
                fontSize: 'clamp(36px, 11vw, 56px)',
                color: '#FF0000',
                textShadow: '0 0 20px #FF0000',
              }}
            >
              {t('cursed', { amount: amount.toLocaleString() })}
            </motion.div>
            <div className="font-noto font-bold text-2xl text-white/70">
              {t('curseBottom')}
            </div>
            <DrinkDisplay drinkResult={displayDrink} drinkColor={drinkColor} drinkLabel={drinkLabel} />
            <SpinAgainButton onSpinAgain={onSpinAgain} onDismiss={onDismiss} />
          </>

        /* ── 일반 결과 ── */
        ) : (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="font-bebas"
              style={{
                fontSize: tier === 'high'
                  ? 'clamp(50px, 15vw, 72px)'
                  : 'clamp(38px, 12vw, 56px)',
                color: mainColor,
                textShadow: `0 0 15px ${mainColor}, 0 0 30px ${mainColor}`,
              }}
            >
              {tier === 'nothing' ? `❌ ${t('nothing')}` : formatAmount(amount)}
            </motion.div>

            <DrinkDisplay drinkResult={displayDrink} drinkColor={drinkColor} drinkLabel={drinkLabel} />
            <SpinAgainButton onSpinAgain={onSpinAgain} onDismiss={onDismiss} />
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── DrinkDisplay ──────────────────────────────────────────────────────────────
function DrinkDisplay({
  drinkResult, drinkColor, drinkLabel,
}: {
  drinkResult: DrinkResult
  drinkColor:  string
  drinkLabel:  string
}) {
  const isShot = drinkResult === 'p100'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center gap-2"
    >
      <GlassFill level={drinkResult} />
      <motion.div
        className="font-bebas text-3xl"
        style={{ color: drinkColor, textShadow: `0 0 10px ${drinkColor}` }}
        animate={isShot ? { scale: [1, 1.1, 1] } : {}}
        transition={isShot ? { duration: 0.4, repeat: Infinity } : {}}
      >
        {drinkLabel}
      </motion.div>
    </motion.div>
  )
}

// ── GlassFill ─────────────────────────────────────────────────────────────────
function GlassFill({ level }: { level: DrinkResult }) {
  const fillPercent = { p25: 25, p50: 50, p70: 70, p100: 100, respin: 0 }[level] ?? 0
  const fillColor   = {
    p25: '#87CEEB', p50: '#FFA500', p70: '#FF4500', p100: '#FF0000', respin: '#39FF14',
  }[level]

  if (level === 'respin') return <div className="text-5xl">🔄</div>

  return (
    <div className="relative w-14 h-20 border-2 border-white/40 rounded-b-xl overflow-hidden bg-black/50">
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: 0 }}
        animate={{ height: `${fillPercent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ background: fillColor, opacity: 0.85 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bebas text-lg">{fillPercent}%</span>
      </div>
    </div>
  )
}

// ── SpinAgainButton ───────────────────────────────────────────────────────────
function SpinAgainButton({
  onSpinAgain, onDismiss,
}: {
  onSpinAgain?: () => void
  onDismiss:    () => void
}) {
  const { t } = useTranslation()
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSpinAgain) onSpinAgain()
    else onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      className="flex flex-col items-center gap-2 mt-2"
    >
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={handleClick}
        className="px-10 py-3 rounded-2xl font-bebas text-2xl tracking-widest border-2 border-[#FFD700]/60 bg-[#FFD700]/10 text-[#FFD700]"
        style={{ boxShadow: '0 0 16px rgba(255,215,0,0.25)' }}
      >
        🎰 {t('spinAgain')}
      </motion.button>
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="font-noto text-white/30 text-xs"
      >
        {t('tapToDismiss')}
      </motion.p>
    </motion.div>
  )
}
