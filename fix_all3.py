import re

with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) ReelCommand import — SlotReel import 줄 찾아서 추가
# 현재 SlotReel import 패턴 확인 후 ReelCommand 추가
if "from '../components/SlotReel'" in c:
    # 이미 SlotReel import 있으면 ReelCommand 추가
    c = re.sub(
        r"import\s+SlotReel\s+from\s+'../components/SlotReel'",
        "import SlotReel, { type ReelCommand } from '../components/SlotReel'",
        c
    )
    c = re.sub(
        r"import\s+\{\s*type\s+ReelCommand\s*\}\s+from\s+'../components/SlotReel'\nimport SlotReel",
        "import SlotReel, { type ReelCommand } from '../components/SlotReel'",
        c
    )
else:
    # SlotReel import 없으면 reelEngine import 뒤에 추가
    c = c.replace(
        "} from '../lib/reelEngine'",
        "} from '../lib/reelEngine'\nimport SlotReel, { type ReelCommand } from '../components/SlotReel'"
    )
print("Step1 done")

# 2) tipAmount / tipTier 추출 — doSpin 안에서 spinResult 바로 뒤에 삽입
# 현재 tip = spinResult.tip 줄 찾기
patterns = [
    "    const tip       = spinResult.tip\n    const drink     = spinResult.drink\n    const tipTier   = spinResult.tipTier\n    const tipAmount = spinResult.tipAmount",
    "    const tip   = spinResult.tip\n    const drink = spinResult.drink",
    "    const tip = spinResult.tip\n    const drink = spinResult.drink",
]
found = False
for pat in patterns:
    if pat in c:
        if "tipAmount" not in pat:
            c = c.replace(pat,
                "    const tip       = spinResult.tip\n    const drink     = spinResult.drink\n    const tipTier   = spinResult.tipTier\n    const tipAmount = spinResult.tipAmount",
                1)
        found = True
        print("Step2 done - pattern:", pat[:40])
        break
if not found:
    # spinResult 선언 줄 찾아서 바로 뒤에 추가
    c = re.sub(
        r"(const spinResult = generateSpin\([^\)]+\))",
        r"\1\n    const tip       = spinResult.tip\n    const drink     = spinResult.drink\n    const tipTier   = spinResult.tipTier\n    const tipAmount = spinResult.tipAmount",
        c, count=1
    )
    print("Step2 done - spinResult 뒤에 삽입")

# 3) SpinPhase 충돌 — SlotReel의 SpinPhase export 제거
with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    sr = f.read()

sr = sr.replace("export type SpinPhase =", "type SpinPhase =")
# SlotReel에서 SpinPhase import하는 경우도 제거
sr = re.sub(r",?\s*SpinPhase\b", "", sr)

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(sr)
print("Step3 done")

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
