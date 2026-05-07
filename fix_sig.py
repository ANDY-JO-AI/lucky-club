with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# React.FC 방식 시그니처 교체
old_sig = "const SlotReel: React.FC<SlotReelProps> = ({\n  type, command, result, className, onLanded\n})"
new_sig = "const SlotReel: React.FC<SlotReelProps> = ({\n  type, command, result, className, onLanded,\n  escalation = 0, tierReveal = null\n})"
if old_sig in c:
    c = c.replace(old_sig, new_sig, 1)
    print("시그니처 교체 성공")
else:
    # 한 줄 버전 시도
    old_sig2 = "const SlotReel: React.FC<SlotReelProps> = ({ type, command, result, className, onLanded })"
    new_sig2 = "const SlotReel: React.FC<SlotReelProps> = ({ type, command, result, className, onLanded, escalation = 0, tierReveal = null })"
    if old_sig2 in c:
        c = c.replace(old_sig2, new_sig2, 1)
        print("시그니처 교체 성공 (한줄 버전)")
    else:
        # 현재 실제 패턴 출력
        import re
        m = re.search(r'const SlotReel[^\{]+\{[^\}]+\}', c)
        print("MATCH_FAILED - 현재 패턴:", m.group(0) if m else "찾기 실패")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
