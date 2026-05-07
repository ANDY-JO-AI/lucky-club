import re

with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) drinkToSymbol 함수 전체 제거 (멀티라인)
c = re.sub(
    r"  function drinkToSymbol\(key: string\): string \{.*?\}\n",
    "",
    c,
    count=1,
    flags=re.DOTALL
)

if "drinkToSymbol" in c:
    print("Step1 WARN - 함수 잔재 남아있음")
else:
    print("Step1 함수 제거 SUCCESS")

# 2) 결과 라벨에서 drinkToSymbol 제거 → labels만 사용
old_result = "`${drinkToSymbol(result as string)} ${labels[result as keyof typeof labels] ?? result}`"
new_result = "(labels[result as keyof typeof labels] ?? result)"
if old_result in c:
    c = c.replace(old_result, new_result, 1)
    print("Step2 결과 라벨 교체 SUCCESS")
else:
    print("Step2 MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("DONE")
