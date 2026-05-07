import re

with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) ReelCommand import 추가 (SlotReel에서 가져오기)
old_import_slot = "} from '../lib/reelEngine'"
new_import_slot = "} from '../lib/reelEngine'\nimport { type ReelCommand } from '../components/SlotReel'"
if "type ReelCommand" not in c:
    c = c.replace(old_import_slot, new_import_slot, 1)
    print("ReelCommand import 추가")
else:
    print("ReelCommand 이미 있음")

# 2) tipAmount 변수 누락 수정
# generateSpin 결과 추출 블록에 tipAmount 추가
old_extract = "    const tip       = spinResult.tip\n    const drink     = spinResult.drink"
new_extract = """    const tip       = spinResult.tip
    const drink     = spinResult.drink
    const tipTier   = spinResult.tipTier
    const tipAmount = spinResult.tipAmount"""
if "const tipAmount" not in c:
    if old_extract in c:
        c = c.replace(old_extract, new_extract, 1)
        print("tipAmount 추가")
    else:
        # 다른 패턴 시도
        old2 = "    const tip   = spinResult.tip\n    const drink = spinResult.drink"
        new2 = """    const tip       = spinResult.tip
    const drink     = spinResult.drink
    const tipTier   = spinResult.tipTier
    const tipAmount = spinResult.tipAmount"""
        if old2 in c:
            c = c.replace(old2, new2, 1)
            print("tipAmount 추가 (패턴2)")
        else:
            print("WARN: tip/drink 추출 패턴 못찾음")
else:
    print("tipAmount 이미 있음")

# 3) SpinPhase 타입 충돌 — GameScreen 내부 export 제거하고 로컬 타입으로 변경
c = c.replace("export type SpinPhase =", "type SpinPhase =", 1)
print("SpinPhase export 제거")

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
