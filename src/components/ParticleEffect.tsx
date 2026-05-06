// Particle effects: gold burst, skull explosion, fire
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface ParticleEffectProps {
  type: 'gold' | 'skull' | 'fire'
  onDone: () => void
}

export default function ParticleEffect({ type, onDone }: ParticleEffectProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [])

  const count = type === 'skull' ? 50 : type === 'fire' ? 30 : 40

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 20
    const distance = 80 + Math.random() * 180
    const rad = (angle * Math.PI) / 180
    const tx = Math.cos(rad) * distance
    const ty = Math.sin(rad) * distance
    const delay = Math.random() * 0.3
    const size = 16 + Math.random() * 16

    const emoji = type === 'skull' ? '💀'
      : type === 'fire' ? ['🔥', '💥', '⚡'][Math.floor(Math.random() * 3)]
      : ['💰', '🪙', '✨', '⭐'][Math.floor(Math.random() * 4)]

    return { tx, ty, delay, size, emoji, i }
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] flex items-center justify-center">
      {particles.map(p => (
        <motion.div
          key={p.i}
          className="absolute"
          style={{ fontSize: p.size }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0, opacity: 0 }}
          transition={{ duration: 1.2 + Math.random() * 0.5, delay: p.delay, ease: 'easeOut' }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}
