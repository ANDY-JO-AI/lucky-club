with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 망가진 "type =" 블록 전체 제거 (SlotReel에는 SpinPhase 불필요)
bad = """type =
  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'
  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'
  | 'nearMiss' | 'stopping'\n"""

if bad in c:
    c = c.replace(bad, "", 1)
    print("SUCCESS")
else:
    # 줄바꿈 차이 대응
    import re
    c = re.sub(
        r"type\s*=\s*\n\s*\|[^\n]+\n(\s*\|[^\n]+\n)+",
        "",
        c
    )
    print("SUCCESS - regex")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
