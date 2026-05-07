with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) Props 인터페이스에 escalation + tierReveal 추가
old_props = """interface SlotReelProps {
  type:       'tip' | 'drink'
  command:    ReelCommand
  result:     TipResult | DrinkResult | null
  className?: string
  onLanded?:  () => void
}"""
new_props = """interface SlotReelProps {
  type:        'tip' | 'drink'
  command:     ReelCommand
  result:      TipResult | DrinkResult | null
  className?:  string
  onLanded?:   () => void
  escalation?: number
  tierReveal?: string | null
}"""
c = c.replace(old_props, new_props, 1)

# 2) Escalation 상수 + colorOf 앞에 삽입
old_colorOf = "function colorOf(type: 'tip' | 'drink', key: string): string {"
new_colorOf = """const ESCALATION_COLORS = [
  'transparent',
  '#fbbf24',
  '#f97316',
  '#ef4444',
  '#dc2626',
]
const ESCALATION_LABELS = [
  '',
  '⚡ 슬슬 터질 것 같은데?',
  '🔥 이번엔 진짜다!!',
  '💥 폭발 직전!!',
  '👑 이번엔 무조건 터진다!!!',
]

function colorOf(type: 'tip' | 'drink', key: string): string {"""
c = c.replace(old_colorOf, new_colorOf, 1)

# 3) 컴포넌트 함수 시그니처에서 props 구조분해에 escalation + tierReveal 추가
old_sig = "export default function SlotReel({\n  type, command, result, className, onLanded\n}: SlotReelProps)"
new_sig = "export default function SlotReel({\n  type, command, result, className, onLanded,\n  escalation = 0, tierReveal = null\n}: SlotReelProps)"
c = c.replace(old_sig, new_sig, 1)

# 시그니처가 한 줄인 경우도 대응
old_sig2 = "export default function SlotReel({ type, command, result, className, onLanded }: SlotReelProps)"
new_sig2 = "export default function SlotReel({ type, command, result, className, onLanded, escalation = 0, tierReveal = null }: SlotReelProps)"
c = c.replace(old_sig2, new_sig2, 1)

# 4) return 바로 앞에 escColor / escLabel 변수 삽입
old_return = "  return (\n    <div"
new_return = """  const escColor = ESCALATION_COLORS[Math.min(escalation, 4)]
  const escLabel = ESCALATION_LABELS[Math.min(escalation, 4)]

  return (
    <div"""
c = c.replace(old_return, new_return, 1)

# 5) 최상위 <div> className 줄 바로 뒤에 style + escalation 라벨 주입
# 최상위 div의 닫는 > 직전에 style 속성 추가
# "relative w-full" 클래스가 포함된 div를 타깃
old_outer = '    <div\n      className={`relative w-full'
new_outer = """    <div
      style={{
        border: `2px solid ${escColor}`,
        boxShadow: escalation > 0 ? `0 0 ${escalation * 10}px ${escColor}` : 'none',
        borderRadius: '0.75rem',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}
      className={`relative w-full"""
c = c.replace(old_outer, new_outer, 1)

# 6) 컴포넌트 닫히는 </div> 바로 앞에 escalation 라벨 + tierReveal 심볼 삽입
# onLanded 콜백 직후 return 블록 맨 끝 </div> 앞에 추가
old_close = "  )\n}\n"
new_close = """      {/* Escalation 긴장 게이지 라벨 */}
      {escalation > 0 && (
        <div
          style={{ color: escColor }}
          className="text-xs font-black text-center mt-1 animate-pulse tracking-tight"
        >
          {escLabel}
        </div>
      )}

      {/* Tier Reveal 심볼 오버레이 */}
      {tierReveal && type === 'tip' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div
            className="text-5xl animate-bounce"
            style={{ filter: 'drop-shadow(0 0 12px gold)' }}
          >
            {tierReveal === 'curse'   ? '💀' :
             tierReveal === 'low'     ? '🥉' :
             tierReveal === 'mid'     ? '🥈' :
             tierReveal === 'high'    ? '🥇' :
             tierReveal === 'jackpot' ? '💎' : ''}
          </div>
          <div className="text-xs font-bold text-white mt-1 opacity-80">
            {tierReveal === 'curse'   ? '저주...' :
             tierReveal === 'low'     ? '소액' :
             tierReveal === 'mid'     ? '중간' :
             tierReveal === 'high'    ? '고액!' :
             tierReveal === 'jackpot' ? 'JACKPOT!!!' : ''}
          </div>
        </div>
      )}
  )
}
"""
c = c.replace(old_close, new_close, 1)

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
