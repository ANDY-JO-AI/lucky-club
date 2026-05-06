// Compass Wheel targeting system
import React, { useEffect, useState } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../store/gameStore'
import { getDirectionLabel } from '../lib/casino'
import { playSound, haptic } from '../lib/sounds'

interface CompassWheelProps {
  targetIndex: number
  playerCount: number
  onDone: () => void
}

export default function CompassWheel({ targetIndex, playerCount, onDone }: CompassWheelProps) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language as 'ko' | 'en' | 'vi') || 'ko'
  const [phase, setPhase] = useState<'spinning' | 'stopping' | 'done'>('spinning')
  const [showArrow, setShowArrow] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const rotation = useMotionValue(0)

  const directionLabel = getDirectionLabel(targetIndex, playerCount, lang)

  // Sector angle per player
  const sectorAngle = 360 / playerCount
  // Target rotation: multiple full spins + land on target sector
  const targetDeg = 360 * 8 + (targetIndex * sectorAngle)
  // Near-miss: overshoot by 2 sectors then snap back
  const nearMissDeg = targetDeg + sectorAngle * 2

  useEffect(() => {
    playSound('compass_spin')
    haptic('light')

    // Phase 1: High speed 0-2s
    const ctrl1 = animate(rotation, nearMissDeg, {
      duration: 2.5,
      ease: [0.4, 0, 0.2, 1],
    })

    // Phase 2: Near-miss wobble then snap to final 2-3s
    const t2 = setTimeout(() => {
      setPhase('stopping')
      animate(rotation, targetDeg, {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // spring overshoot
      }).then(() => {
        playSound('compass_stop')
        haptic('strong')
        setPhase('done')
        setShowArrow(true)
        setTimeout(() => setShowLabel(true), 200)
        setTimeout(onDone, 4000)
      })
    }, 2500)

    return () => {
      ctrl1.stop()
      clearTimeout(t2)
    }
  }, [])

  const displayRotation = useTransform(rotation, v => `rotate(${v}deg)`)

  // Generate sectors
  const sectors = Array.from({ length: playerCount }, (_, i) => {
    const angle = (i * 360) / playerCount
    const label = getDirectionLabel(i, playerCount, lang)
    const isTarget = i === targetIndex
    return { angle, label, isTarget, i }
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-[8000] flex flex-col items-center justify-center bg-black/90"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="text-center mb-6">
        <p className="font-bebas text-2xl text-[#FFD700]/60 tracking-widest">
          {phase === 'done' ? '🎯 결과' : '🧭 방향 선택 중...'}
        </p>
      </div>

      {/* Compass wheel */}
      <div className="relative" style={{ width: 280, height: 280 }}>

        {/* Fixed outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#FFD700]/40"
          style={{ boxShadow: '0 0 20px rgba(255,215,0,0.2)' }}
        />

        {/* Pointer (fixed at top) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ top: -12 }}
        >
          <motion.div
            animate={phase === 'done' ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <svg width="24" height="36" viewBox="0 0 24 36">
              <polygon
                points="12,0 24,36 12,28 0,36"
                fill="#FFD700"
                style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Rotating disk */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            rotate: rotation,
            background: '#111',
            border: '2px solid #333',
          }}
        >
          {/* Sector dividers */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
            {sectors.map(({ angle, i, isTarget }) => {
              const angleRad = (angle - 90) * Math.PI / 180
              const nextAngleRad = (angle + sectorAngle - 90) * Math.PI / 180
              const cx = 140, cy = 140, r = 134
              const x1 = cx + r * Math.cos(angleRad)
              const y1 = cy + r * Math.sin(angleRad)
              const x2 = cx + r * Math.cos(nextAngleRad)
              const y2 = cy + r * Math.sin(nextAngleRad)
              const midAngle = (angle + sectorAngle / 2 - 90) * Math.PI / 180
              const labelR = 90
              const lx = cx + labelR * Math.cos(midAngle)
              const ly = cy + labelR * Math.sin(midAngle)
              const largeArc = sectorAngle > 180 ? 1 : 0

              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={isTarget ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)'}
                    stroke={isTarget ? '#FFD700' : '#333'}
                    strokeWidth={isTarget ? 2 : 1}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isTarget ? '#FFD700' : '#FFFFFF80'}
                    fontSize={playerCount <= 4 ? 14 : playerCount <= 8 ? 11 : 9}
                    fontFamily="Noto Sans KR, sans-serif"
                    fontWeight="bold"
                    transform={`rotate(${angle + sectorAngle / 2}, ${lx}, ${ly})`}
                  >
                    {i + 1}
                  </text>
                </g>
              )
            })}

            {/* Center dot */}
            <circle cx="140" cy="140" r="12" fill="#FFD700" style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }} />
          </svg>
        </motion.div>

        {/* Target sector highlight overlay */}
        {phase === 'done' && showArrow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: 'inset 0 0 30px rgba(255,215,0,0.3)' }}
          />
        )}
      </div>

      {/* Direction label */}
      <AnimatedLabel show={showLabel} label={directionLabel} />

      {/* Sub-instructions */}
      {phase !== 'done' && (
        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="mt-4 font-noto text-white/40 text-sm"
        >
          방향을 선택하는 중...
        </motion.p>
      )}
    </motion.div>
  )
}

function AnimatedLabel({ show, label }: { show: boolean; label: string }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={false}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="mt-8 text-center"
    >
      <motion.div
        animate={show ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
        className="font-bebas tracking-widest"
        style={{
          fontSize: 'clamp(48px, 14vw, 72px)',
          color: '#FFD700',
          textShadow: '0 0 20px #FFD700, 0 0 40px #FF8C00',
        }}
      >
        👉 {label}!
      </motion.div>
    </motion.div>
  )
}
