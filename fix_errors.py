import re

with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) SpinPhase 타입에 누락된 값 추가
old_phase = "type SpinPhase =\n  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'\n  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'\n  | 'nearMiss' | 'stopping'"
new_phase = "type SpinPhase =\n  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'\n  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'\n  | 'nearMiss' | 'stopping'"
# SpinPhase가 SlotReel에서 import된 경우 제거하고 직접 정의
c = re.sub(
    r"type SpinPhase\s*=\s*\n\s*\|[^\n]+\n(\s*\|[^\n]+\n)*",
    "type SpinPhase =\n  | 'idle' | 'spinning' | 'drinkStopping' | 'drinkRevealed'\n  | 'tipStopping' | 'tipRevealed' | 'celebration' | 'billboard'\n  | 'nearMiss' | 'stopping'\n",
    c
)

# 2) ReelCommand 중복 import 제거 (SlotReel에서 import하는 것 제거)
c = re.sub(r",?\s*type ReelCommand\b", "", c)
c = re.sub(r"type ReelCommand\b,?\s*", "", c)

# 3) reelEngine import에서 SpinResult 타입 제거 (충돌 방지)
c = c.replace("  type SpinResult\n} from '../lib/reelEngine'", "} from '../lib/reelEngine'")
c = c.replace(", type SpinResult", "")

# 4) spinResult 스코프 문제 수정
# doSpin 안에서 spinResult를 let으로 선언했는지 확인 후
# tierReveal 참조를 spinResult.tipTier 대신 직접 변수로 교체
c = c.replace(
    "      const tier = spinResult.tipTier\n      setTierReveal(tier)",
    "      setTierReveal(tipTier)"
)
c = c.replace(
    "      const target = spinResult.tipAmount",
    "      const target = tipAmount"
)

# 5) tipTier, tipAmount 변수 선언 추가 (generateSpin 결과에서 추출)
old_spin_result = "    const tip   = spinResult.tip\n    const drink = spinResult.drink"
new_spin_result = """    const tip       = spinResult.tip
    const drink     = spinResult.drink
    const tipTier   = spinResult.tipTier
    const tipAmount = spinResult.tipAmount"""
c = c.replace(old_spin_result, new_spin_result, 1)

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
