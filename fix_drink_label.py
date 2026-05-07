with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# DRINK 칸은 심볼 대신 원래 labels(퍼센트) 표시로 복원
old_render = """                {type === 'tip'
                  ? tipToSymbol(item)
                  : drinkToSymbol(item)}"""
new_render = """                {type === 'tip'
                  ? tipToSymbol(item)
                  : (labels[item as keyof typeof labels] ?? item)}"""
c = c.replace(old_render, new_render, 1)

# 결과 레이블도 DRINK는 원래 labels로 복원 (이미 맞게 되어있지만 확인)
with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
