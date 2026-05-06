// Screen flash effect for tier results
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScreenFlashProps {
  color: string | null
  count: number
}

export default function ScreenFlash({ color, count }: ScreenFlashProps) {
  const [flashes, setFlashes] = useState<number[]>([])

  useEffect(() => {
    if (!color || count <= 0) { setFlashes([]); return }
    const ids = Array.from({ length: count }, (_, i) => i)
    setFlashes(ids)
    const t = setTimeout(() => setFlashes([]), count * 200)
    return () => clearTimeout(t)
  }, [color, count])

  return (
    <AnimatePresence>
      {flashes.map(i => (
        <motion.div
          key={`flash-${i}-${Date.now()}`}
          className="fixed inset-0 pointer-events-none z-[9995]"
          style={{ background: color || '#FFF' }}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.15, delay: i * 0.18 }}
        />
      ))}
    </AnimatePresence>
  )
}
