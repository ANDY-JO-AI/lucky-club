with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old_close = """    </div>
  )
}

export default SlotReel"""

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
    </div>
  )
}

export default SlotReel"""

if old_close in c:
    c = c.replace(old_close, new_close, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
