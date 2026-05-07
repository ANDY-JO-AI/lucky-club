with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) DRINK_SYMBOL_POOL을 퍼센트 텍스트로 교체
old_pool = "const DRINK_SYMBOL_POOL = ['\U0001f964','\U0001f37a','\U0001f37a','\U0001f525','\U0001f525','\U0001f4a5']"
new_pool = "const DRINK_SYMBOL_POOL = ['25%','50%','50%','70%','70%','100%']"
if old_pool in c:
    c = c.replace(old_pool, new_pool, 1)
    print("Step1 DRINK_SYMBOL_POOL 교체 SUCCESS")
else:
    import re
    c = re.sub(
        r"const DRINK_SYMBOL_POOL = \[[^\]]+\]",
        "const DRINK_SYMBOL_POOL = ['25%','50%','50%','70%','70%','100%']",
        c, count=1
    )
    print("Step1 DRINK_SYMBOL_POOL 교체 SUCCESS - regex")

# 2) TIP_SYMBOL_POOL JACKPOT 확인 및 보정
old_tip_pool = """const TIP_SYMBOL_POOL = [
  '\U0001f480','\U0001f3b0 SMALL','\U0001f3b0 SMALL','\U0001f3b0 MID','\U0001f3b0 MID',
  '\U0001f3b0 BIG','\U0001f3b0 BIG','\U0001f3b0 MEGA','\U0001f389 JACKPOT',
]"""
new_tip_pool = """const TIP_SYMBOL_POOL = [
  '\U0001f480','\U0001f3b0 SMALL','\U0001f3b0 SMALL','\U0001f3b0 MID','\U0001f3b0 MID',
  '\U0001f3b0 BIG','\U0001f3b0 BIG','\U0001f3b0 MEGA','\U0001f3b0 MEGA','\U0001f389 JACKPOT',
]"""
if old_tip_pool in c:
    c = c.replace(old_tip_pool, new_tip_pool, 1)
    print("Step2 TIP_SYMBOL_POOL 보정 SUCCESS")
else:
    print("Step2 TIP_SYMBOL_POOL 이미 정상 또는 패턴 불일치 - 스킵")

# 3) tipToSymbol 함수에서 jackpot 심볼 확인 및 수정
import re
c = re.sub(
    r"if \(key === 'jackpot'\)\s+return '[^']*'",
    "if (key === 'jackpot')   return '\U0001f389 JACKPOT'",
    c, count=1
)
print("Step3 jackpot 심볼 수정 SUCCESS")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("DONE")
