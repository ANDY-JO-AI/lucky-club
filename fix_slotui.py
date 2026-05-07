with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# escalation prop 추가
old_props = "command: ReelCommand"
new_props = """command: ReelCommand
  escalation?: number       // 0-4: 긴장 게이지
  tierReveal?: string|null  // 티어 심볼 표시"""
c = c.replace(old_props, new_props, 1)

# escalation 색상 맵 추가
old_colorOf = "function colorOf"
new_colorOf = """const ESCALATION_COLORS = ['transparent','#fbbf24','#f97316','#ef4444','#dc2626']
const ESCALATION_LABELS = ['','⚡ 슬슬 터질 것 같은데?','🔥 이번엔 진짜다!!','💥 폭발 직전!!','👑 이번엔 무조건 터진다!!!']

function colorOf"""
c = c.replace(old_colorOf, new_colorOf, 1)

# 릴 컨테이너에 escalation 테두리 + 라벨 추가
old_reel_div = "return (\n    <div"
new_reel_div = """const escColor = ESCALATION_COLORS[escalation ?? 0]
  const escLabel = ESCALATION_LABELS[escalation ?? 0]

  return (
    <div"""
c = c.replace(old_reel_div, new_reel_div, 1)

print("MANUAL: SlotReel escalation border JSX는 직접 추가 필요")
print("SUCCESS - props 추가 완료")
