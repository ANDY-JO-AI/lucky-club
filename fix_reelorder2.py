with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) Props에 reelOrder 추가
old_props = "  escalation?: number"
new_props = "  reelOrder?:  string[]\n  escalation?: number"
if "reelOrder" not in c:
    c = c.replace(old_props, new_props, 1)
    print("Step1: reelOrder prop 추가")

# 2) 시그니처에 reelOrder 추가
old_sig = "  escalation = 0, tierReveal = null,"
new_sig = "  reelOrder,\n  escalation = 0, tierReveal = null,"
if "reelOrder," not in c:
    c = c.replace(old_sig, new_sig, 1)
    print("Step2: 시그니처 추가")

# 3) order 결정 로직에 reelOrder 우선 적용
old_order = "  const order  = type === 'tip'\n    ? (TIP_REEL_ORDER  as readonly string[])\n    : (DRINK_REEL_ORDER as readonly string[])"
new_order = "  const order  = reelOrder && reelOrder.length > 0\n    ? reelOrder\n    : type === 'tip'\n      ? (TIP_REEL_ORDER  as readonly string[])\n      : (DRINK_REEL_ORDER as readonly string[])"
if "reelOrder && reelOrder.length" not in c:
    c = c.replace(old_order, new_order, 1)
    print("Step3: order 로직 교체")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
