import sys

with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 교체할 구간 시작/끝 마커로 잘라내기
START = '    // ── Timeline ──'
END   = '    // 2.8 s + celebDelay'

i1 = c.find(START)
i2 = c.find(END)

if i1 == -1 or i2 == -1:
    print('MARKER_NOT_FOUND', i1, i2)
    sys.exit(1)

NEW_BLOCK = '''    // ── Timeline ──

    // 1.5 s - DRINK 릴 감속 시작
    later(() => {
      setDrinkResult(drink)
      setPhase('drinkStopping')
    }, 1500)

    // 2.2 s - DRINK 확정 + TIP 릴 계속 회전
    later(() => {
      setPhase('drinkRevealed')
      playSound('slot_stop')
      haptic('light')
      if (drink === 'p100') playSound('siren')
      else if (drink === 'p70') playSound('warning_beep')
    }, 2200)

    // 3.0 s - TIP 릴 감속 시작
    later(() => {
      setTipResult(tip)
      setPhase('tipStopping')
      stopDrumroll()
      if ((tipTier === 'jackpot' || tipTier === 'high') && store.config.autoBillboard) {
        setQuestionMode(true)
      }
    }, 3000)

    // 3.9 s - TIP 확정 공개
    later(() => {
      setPhase('tipRevealed')
      setQuestionMode(false)
      setNearMissTip(null)
      setNearMissDrink(null)
      playSound('slot_stop')
      haptic('light')
    }, 3900)

    '''

c = c[:i1] + NEW_BLOCK + c[i2:]

# 타이밍 조정
c = c.replace('}, 2800 + celebDelay)', '}, 4400 + celebDelay)')
c = c.replace('}, 3500 + celebDelay)', '}, 5100 + celebDelay)')
c = c.replace('}, 4200 + celebDelay)', '}, 5800 + celebDelay)')

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('SUCCESS')
