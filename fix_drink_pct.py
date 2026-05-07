with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) drinkToSymbol 함수 전체 제거
import re
c = re.sub(
    r"\n  function drinkToSymbol\(key: string\): string \{[^}]+\}\n",
    "\n",
    c,
    count=1
)

# 2) 렌더링 라인 교체 (드링크는 labels 직접 사용)
old_render = "{type === 'tip' ? tipToSymbol(item) : drinkToSymbol(item)}"
new_render = "{type === 'tip' ? tipToSymbol(item) : (labels[item as keyof typeof labels] ?? item)}"
if old_render in c:
    c = c.replace(old_render, new_render, 1)
    print("Step1 렌더링 교체 SUCCESS")
else:
    print("Step1 MATCH_FAILED - 렌더링 라인 못찾음")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
