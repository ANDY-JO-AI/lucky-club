import re

with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) DRINK_SYMBOL_POOL 맥주잔 이모지로 교체
c = re.sub(
    r"const DRINK_SYMBOL_POOL = \[[^\]]+\]",
    "const DRINK_SYMBOL_POOL = ['\U0001f37a','\U0001f37a\U0001f37a','\U0001f37a\U0001f37a','\U0001f37a\U0001f37a\U0001f37a','\U0001f37a\U0001f37a\U0001f37a\U0001f37a','\U0001f37a\U0001f37a\U0001f37a\U0001f37a']",
    c, count=1
)
print("Step1 DRINK_SYMBOL_POOL 교체 SUCCESS")

# 2) labels 맥주잔으로 교체
old_labels = """  const labels: Record<string, string> = {
    p25: '25%',
    p50: '50%',
    p70: '70%',
    p100: '100%',
    respin: '\U0001f504',
  }"""
new_labels = """  const labels: Record<string, string> = {
    p25: '\U0001f37a 25%',
    p50: '\U0001f37a\U0001f37a 50%',
    p70: '\U0001f37a\U0001f37a\U0001f37a 75%',
    p100: '\U0001f37a\U0001f37a\U0001f37a\U0001f37a ONE SHOT!!',
    respin: '\U0001f504 RESPIN',
  }"""
if old_labels in c:
    c = c.replace(old_labels, new_labels, 1)
    print("Step2 labels 교체 SUCCESS")
else:
    c = re.sub(
        r"p25:\s*'[^']*'",
        "p25: '\U0001f37a 25%'",
        c, count=1
    )
    c = re.sub(
        r"p50:\s*'[^']*'",
        "p50: '\U0001f37a\U0001f37a 50%'",
        c, count=1
    )
    c = re.sub(
        r"p70:\s*'[^']*'",
        "p70: '\U0001f37a\U0001f37a\U0001f37a 75%'",
        c, count=1
    )
    c = re.sub(
        r"p100:\s*'[^']*'",
        "p100: '\U0001f37a\U0001f37a\U0001f37a\U0001f37a ONE SHOT!!'",
        c, count=1
    )
    print("Step2 labels 교체 SUCCESS - regex")

# 3) TIP 릴 비중앙 칸 버그 수정
# revealed=true 일 때는 무조건 표시되도록
old_op = """            const isSpinning = !revealed
            const opacity    = isCenter
              ? 1
              : (type === 'tip' && isSpinning) ? 0 : Math.max(0.55, 1 - dist * 0.15)"""
new_op = """            const isSpinning = !revealed
            const opacity    = isCenter
              ? 1
              : revealed
                ? Math.max(0.55, 1 - dist * 0.15)
                : (type === 'tip') ? 0 : Math.max(0.55, 1 - dist * 0.15)"""
if old_op in c:
    c = c.replace(old_op, new_op, 1)
    print("Step3 TIP opacity 버그 수정 SUCCESS")
else:
    print("Step3 MATCH_FAILED - opacity 패턴 확인 필요")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("DONE")
