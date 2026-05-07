with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) casino import에 shuffledTipReel, shuffledDrinkReel 추가
old_casino = "  spinSlots, getCompassTarget, shouldTriggerMission,\n  getMissionLevel, getEscalationParams,"
new_casino = "  spinSlots, getCompassTarget, shouldTriggerMission,\n  getMissionLevel, getEscalationParams,\n  shuffledTipReel, shuffledDrinkReel,"
if "shuffledTipReel" not in c:
    c = c.replace(old_casino, new_casino, 1)
    print("Step1: import 추가")
else:
    print("Step1: 이미 있음")

# 2) SlotReel에 reelOrder + escalation + tierReveal props 전달
# drinkCmd SlotReel 태그 찾아서 reelOrder 추가
old_drink_reel = '          command={drinkCmd}'
new_drink_reel = '          command={drinkCmd}\n          reelOrder={shuffledDrinkReel}'
if "reelOrder={shuffledDrinkReel}" not in c:
    c = c.replace(old_drink_reel, new_drink_reel, 1)
    print("Step2a: drinkReel reelOrder 추가")

old_tip_reel = '          command={tipCmd}'
new_tip_reel = '          command={tipCmd}\n          reelOrder={shuffledTipReel}\n          escalation={escalation}\n          tierReveal={tierReveal}'
if "reelOrder={shuffledTipReel}" not in c:
    c = c.replace(old_tip_reel, new_tip_reel, 1)
    print("Step2b: tipReel reelOrder+escalation+tierReveal 추가")

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
