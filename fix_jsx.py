with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = """          <SlotReel
            type="tip"
            phase={phase}
            result={tipResult}
            nearMiss={nearMissTip}
            className="flex-1"
          />
          <SlotReel
            type="drink"
            phase={phase}
            result={drinkResult}
            nearMiss={nearMissDrink}
            className="flex-1"
          />"""

new = """          <SlotReel
            type="drink"
            command={drinkCmd}
            result={drinkResult}
            className="flex-1"
          />
          <SlotReel
            type="tip"
            command={tipCmd}
            result={tipResult}
            className="flex-1"
          />"""

if old in c:
    c = c.replace(old, new)
    with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print('SUCCESS')
else:
    print('MATCH_FAILED')
