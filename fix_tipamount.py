with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old = "    const tipTier    = getTipTier(tip)"
new = """    const tipTier    = getTipTier(tip)
    const tipAmount  = tip === 'nothing' ? 0 : parseInt(tip.replace('t',''), 10)"""

if old in c:
    c = c.replace(old, new, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
