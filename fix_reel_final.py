import re

with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) DRINK_SYMBOL_POOL → 실제 키값으로 교체 (labels 매칭용)
c = re.sub(
    r"const DRINK_SYMBOL_POOL = \[[^\]]+\]",
    "const DRINK_SYMBOL_POOL = ['p25','p50','p50','p70','p70','p100']",
    c, count=1
)
print("Step1 DRINK_SYMBOL_POOL 키값으로 교체 SUCCESS")

# 2) TIP 릴 idle 상태에서도 비중앙 표시되도록 수정
# 회전 중(spin command)일 때만 숨김, idle/revealed 상태는 표시
old_op = """            const isSpinning = !revealed
            const opacity    = isCenter
              ? 1
              : revealed
                ? Math.max(0.55, 1 - dist * 0.15)
                : (type === 'tip') ? 0 : Math.max(0.55, 1 - dist * 0.15)"""
new_op = """            const isSpinning = !revealed
            const isActiveSpinning = isSpinning && command === 'spin'
            const opacity    = isCenter
              ? 1
              : (type === 'tip' && isActiveSpinning)
                ? 0
                : Math.max(0.55, 1 - dist * 0.15)"""
if old_op in c:
    c = c.replace(old_op, new_op, 1)
    print("Step2 TIP opacity 수정 SUCCESS")
else:
    print("Step2 MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("DONE")
