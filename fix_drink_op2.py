with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old_op = "            const opacity  = isCenter ? 1 : Math.max(0.55, 1 - dist * 0.15)"
new_op = """            const isSpinning = !revealed
            const opacity    = isCenter
              ? 1
              : (type === 'tip' && isSpinning) ? 0 : Math.max(0.55, 1 - dist * 0.15)"""

if old_op in c:
    c = c.replace(old_op, new_op, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
