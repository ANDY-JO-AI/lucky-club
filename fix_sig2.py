with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old_sig = "const SlotReel: React.FC<SlotReelProps> = ({\n  type, command, result, className = '', onLanded,\n})"
new_sig = "const SlotReel: React.FC<SlotReelProps> = ({\n  type, command, result, className = '', onLanded,\n  escalation = 0, tierReveal = null,\n})"

if old_sig in c:
    c = c.replace(old_sig, new_sig, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
