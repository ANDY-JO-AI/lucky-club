with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) tipToSymbol 함수 전체 교체
old_sym = """function tipToSymbol(key: string): string {
  if (key === 'nothing')  return '💀'
  if (key === 'jackpot')  return '💎'
  if (key === 'w200k')    return '💎'
  if (key === 'w100k')    return '🥇'
  if (key === 'w50k')     return '🥇'
  if (key === 'w20k')     return '🥈'
  if (key === 'w10k')     return '🥈'
  if (key === 'w5k')      return '🥉'
  if (key === 'w2k')      return '🥉'
  if (key === 'w1k')      return '🥉'
  return '🎰'
}"""
new_sym = """function tipToSymbol(key: string): string {
  if (key === 'nothing')  return '💀'
  if (key === 'jackpot')  return '🎉 JACKPOT'
  if (key === 'w200k')    return '🎰 MEGA'
  if (key === 'w100k')    return '🎰 MEGA'
  if (key === 'w50k')     return '🎰 BIG'
  if (key === 'w20k')     return '🎰 BIG'
  if (key === 'w10k')     return '🎰 MID'
  if (key === 'w5k')      return '🎰 MID'
  if (key === 'w2k')      return '🎰 SMALL'
  if (key === 'w1k')      return '🎰 SMALL'
  return '🎰'
}"""
c = c.replace(old_sym, new_sym, 1)

# 2) 결과 레이블 티어명도 동일하게 변경
old_label = """            {type === 'tip'
              ? `${tipToSymbol(result as string)} ${
                  result === 'jackpot' ? 'JACKPOT!' :
                  result === 'w200k'   ? '전설급!!' :
                  result === 'w100k'   ? '고액!' :
                  result === 'w50k'    ? '고액!' :
                  result === 'w20k'    ? '중간' :
                  result === 'w10k'    ? '중간' :
                  result === 'w5k'     ? '소액' :
                  result === 'w2k'     ? '소액' :
                  result === 'w1k'     ? '소액' :
                  result === 'nothing' ? '저주...' : ''}`
              : `${drinkToSymbol(result as string)} ${labels[result as keyof typeof labels] ?? result}`}"""
new_label = """            {type === 'tip'
              ? tipToSymbol(result as string)
              : `${drinkToSymbol(result as string)} ${labels[result as keyof typeof labels] ?? result}`}"""
c = c.replace(old_label, new_label, 1)

# 3) Tier Reveal 오버레이 심볼도 동일하게 변경
old_tier = """            {tierReveal === 'curse'   ? '💀' :
             tierReveal === 'low'     ? '🥉' :
             tierReveal === 'mid'     ? '🥈' :
             tierReveal === 'high'    ? '🥇' :
             tierReveal === 'jackpot' ? '💎' : ''}"""
new_tier = """            {tierReveal === 'curse'   ? '💀' :
             tierReveal === 'low'     ? '🎰 SMALL' :
             tierReveal === 'mid'     ? '🎰 MID' :
             tierReveal === 'high'    ? '🎰 BIG' :
             tierReveal === 'jackpot' ? '🎉 JACKPOT' : ''}"""
c = c.replace(old_tier, new_tier, 1)

old_tier2 = """            {tierReveal === 'curse'   ? '저주...' :
             tierReveal === 'low'     ? '소액' :
             tierReveal === 'mid'     ? '중간' :
             tierReveal === 'high'    ? '고액!' :
             tierReveal === 'jackpot' ? 'JACKPOT!!!' : ''}"""
new_tier2 = """            {tierReveal === 'curse'   ? '💀 저주...' :
             tierReveal === 'low'     ? 'SMALL' :
             tierReveal === 'mid'     ? 'MID' :
             tierReveal === 'high'    ? 'BIG' :
             tierReveal === 'jackpot' ? '🎉 JACKPOT!!!' : ''}"""
c = c.replace(old_tier2, new_tier2, 1)

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("Step1 SUCCESS")

# 4) GameScreen.tsx — doSpin 시작 시 tierReveal 리셋
with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    g = f.read()

old_reset = "    setTierReveal(null)\n    setCountUpVal(0)"
if old_reset in g:
    print("Step2: tierReveal 리셋 이미 있음")
else:
    old_spin_start = "    setDrinkCmd('spin')\n    setTipCmd('idle')"
    new_spin_start = "    setDrinkCmd('spin')\n    setTipCmd('idle')\n    setTierReveal(null)\n    setCountUpVal(0)"
    if old_spin_start in g:
        g = g.replace(old_spin_start, new_spin_start, 1)
        print("Step2: tierReveal 리셋 추가")
    else:
        print("Step2: WARN - 패턴 못찾음, 수동 확인 필요")

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(g)
print("SUCCESS")
