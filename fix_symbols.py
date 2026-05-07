with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) 티어 심볼 매핑 함수 추가 (colorOf 함수 앞에 삽입)
old_colorof = "function colorOf(type: 'tip' | 'drink', key: string): string {"
new_colorof = """// 티어 심볼 매핑 — 금액 대신 심볼로만 표시
function tipToSymbol(key: string): string {
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
}

function drinkToSymbol(key: string): string {
  if (key === 'p100')   return '💥'
  if (key === 'p70')    return '🔥'
  if (key === 'p50')    return '🍺'
  if (key === 'p25')    return '🥤'
  if (key === 'respin') return '🔄'
  return '🍶'
}

function colorOf(type: 'tip' | 'drink', key: string): string {"""
c = c.replace(old_colorof, new_colorof, 1)

# 2) 릴 칸 렌더링에서 labels 대신 심볼 사용
old_render = """                {labels[item as keyof typeof labels] ?? item}"""
new_render = """                {type === 'tip'
                  ? tipToSymbol(item)
                  : drinkToSymbol(item)}"""
c = c.replace(old_render, new_render, 1)

# 3) 결과 레이블도 심볼 + 티어명으로 표시 (금액 숨김)
old_label = """            {labels[result as keyof typeof labels] ?? result}"""
new_label = """            {type === 'tip'
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
c = c.replace(old_label, new_label, 1)

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
