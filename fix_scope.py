import re

# ── GameScreen.tsx 수정 ──────────────────────────────────────
with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) tipAmount 스코프 문제:
# later() 콜백 안에서 tipAmount를 참조하므로
# doSpin 최상단에 let tipAmount 선언 추가
old_spin = "    const spinResult = generateSpin(spinHistory, pityCnt, escalation)"
new_spin = """    const spinResult    = generateSpin(spinHistory, pityCnt, escalation)
    const tip           = spinResult.tip
    const drink         = spinResult.drink
    const tipTier       = spinResult.tipTier
    const tipAmount     = spinResult.tipAmount"""

# 기존에 tip/drink/tipTier/tipAmount 중복 선언 제거 후 교체
c = re.sub(
    r"const spinResult\s*=\s*generateSpin\([^\)]+\)\n(\s*const tip[^\n]+\n)*(\s*const drink[^\n]+\n)?(\s*const tipTier[^\n]+\n)?(\s*const tipAmount[^\n]+\n)?",
    new_spin + "\n",
    c, count=1
)
print("Step1 tipAmount 스코프 수정")

# 2) SpinPhase 충돌 — SpinButton import에서 SpinPhase 제거
# SpinButton.tsx 에서 SpinPhase를 import하는 경우 대응
with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)

# ── SpinButton.tsx 수정 ────────────────────────────────────
import os
spinbtn_path = "src/components/SpinButton.tsx"
if os.path.exists(spinbtn_path):
    with open(spinbtn_path, "r", encoding="utf-8") as f:
        sb = f.read()
    # SpinButton이 GameScreen에서 SpinPhase를 import하면 제거
    sb = re.sub(r"import\s*\{[^}]*SpinPhase[^}]*\}\s*from\s*'[^']*GameScreen[^']*'\s*\n?", "", sb)
    sb = re.sub(r"import\s*\{[^}]*SpinPhase[^}]*\}\s*from\s*'[^']*'\s*\n?", "", sb)
    # SpinPhase 타입을 string으로 대체
    sb = re.sub(r":\s*SpinPhase\b", ": string", sb)
    with open(spinbtn_path, "w", encoding="utf-8") as f:
        f.write(sb)
    print("Step2 SpinButton SpinPhase 제거")
else:
    print("Step2 SpinButton.tsx 없음 - 스킵")

print("SUCCESS")
