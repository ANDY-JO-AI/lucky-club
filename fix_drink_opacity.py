import re

with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 현재 opacity 로직 교체 — DRINK는 항상 표시, TIP만 회전 중 비중앙 숨김
old_opacity = """            const isSpinning  = !revealed
            const isTipType  = type === 'tip'
            const stepsLeft  = TIP_DECEL_STEPS.length - decelStep
            const isDimmed   = isTipType && !revealed && stepsLeft <= 2 && isCenter
            const opacity    = isCenter
              ? (isDimmed ? 0.25 : 1)
              : isSpinning ? 0 : Math.max(0.55, 1 - dist * 0.15)"""

new_opacity = """            const isSpinning  = !revealed
            const isTipType  = type === 'tip'
            const stepsLeft  = TIP_DECEL_STEPS.length - decelStep
            const isDimmed   = isTipType && !revealed && stepsLeft <= 2 && isCenter
            const opacity    = isCenter
              ? (isDimmed ? 0.25 : 1)
              : isTipType && isSpinning ? 0 : Math.max(0.55, 1 - dist * 0.15)"""

if old_opacity in c:
    c = c.replace(old_opacity, new_opacity, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
