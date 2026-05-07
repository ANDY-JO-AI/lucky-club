import re

with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 망가진 SpinPhase 전체를 정확히 교체
bad_pattern = re.compile(
    r"export type SpinPhase\s*=\s*\n.*?(?=\n\n|\nexport|\nconst|\nimport)",
    re.DOTALL
)

good_phase = """export type SpinPhase =
  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'
  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'
  | 'nearMiss' | 'stopping'"""

c = bad_pattern.sub(good_phase, c, count=1)

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
