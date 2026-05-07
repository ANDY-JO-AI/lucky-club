with open("src/pages/GameScreen.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1) import 추가
old_import = "import { playSound, haptic"
new_import = """import {
  generateSpin, TIP_TIER_MAP, TIER_SYMBOL, TIER_COLOR,
  BASE_TIP_REEL, BASE_DRINK_REEL,
  type SpinResult
} from '../lib/reelEngine'
import { playSound, haptic"""
c = c.replace(old_import, new_import, 1)

# 2) state 추가 (useState 블록 뒤에 삽입)
old_state = "  const [teaseMessage, setTeaseMessage]"
new_state = """  // ── Addiction Engine States ──────────────────────────────
  const [pityCnt,     setPityCnt]     = useState(0)
  const [escalation,  setEscalation]  = useState(0)
  const [spinHistory, setSpinHistory] = useState<string[]>([])
  const [tierReveal,  setTierReveal]  = useState<string|null>(null)
  const [countUpVal,  setCountUpVal]  = useState(0)
  const [teaseMessage, setTeaseMessage]"""
c = c.replace(old_state, new_state, 1)

# 3) doSpin 내부에서 generateSpin 호출로 결과 생성
old_spin = "    const tip   = pickTip()"
new_spin = """    const spinResult = generateSpin(spinHistory, pityCnt, escalation)
    const tip   = spinResult.tip
    const drink = spinResult.drink
    const shuffledTipReel   = spinResult.shuffledTipReel
    const shuffledDrinkReel = spinResult.shuffledDrinkReel
    setPityCnt(spinResult.pityCnt)
    setEscalation(spinResult.escalation)
    setSpinHistory(prev => [...prev.slice(-4), tip])
    setTierReveal(null)
    setCountUpVal(0)"""
c = c.replace(old_spin, new_spin, 1)

# 4) pickDrink() 제거 (generateSpin이 대체)
c = c.replace("    const drink  = pickDrink()\n", "", 1)

# 5) TIP 공개 시점(tipRevealed)에 Tier Reveal + 카운트업 삽입
old_tip_reveal = "      setPhase('tipRevealed')"
new_tip_reveal = """      setPhase('tipRevealed')
      // Tier Reveal: 심볼 먼저 표시
      const tier = spinResult.tipTier
      setTierReveal(tier)
      // 카운트업: 0 → 최종 금액 (1.2초)
      const target = spinResult.tipAmount
      if (target > 0) {
        let cur = 0
        const step = Math.ceil(target / 24)
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target)
          setCountUpVal(cur)
          if (cur >= target) clearInterval(iv)
        }, 50)
      }"""
c = c.replace(old_tip_reveal, new_tip_reveal, 1)

with open("src/pages/GameScreen.tsx", "w", encoding="utf-8") as f:
    f.write(c)
print("SUCCESS")
