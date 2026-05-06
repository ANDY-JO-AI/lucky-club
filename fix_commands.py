with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. SpinPhase 타입 선언부에 ReelCommand 추가
old1 = "  | 'nearMiss'"
new1 = "  | 'nearMiss'\ntype ReelCommand = 'idle' | 'spin' | 'decel' | 'revealed'"
c = c.replace(old1, new1, 1)

# 2. tipResult/drinkResult state 아래에 command state 추가
old2 = "  const [nearMissTip, setNearMissTip]"
new2 = "  const [drinkCmd, setDrinkCmd] = useState<ReelCommand>('idle')\n  const [tipCmd,   setTipCmd]   = useState<ReelCommand>('idle')\n  const [nearMissTip, setNearMissTip]"
c = c.replace(old2, new2, 1)

# 3. resetToIdle에 command 리셋 추가
old3 = "  const resetToIdle = () => {\n    setPhase('idle')\n    setTipResult(null)\n    setDrinkResult(null)\n    setFlashColor(null)\n    setCoinRainCount(0)\n    setShowParticles(null)\n    setQuestionMode(false)\n  }"
new3 = "  const resetToIdle = () => {\n    setPhase('idle')\n    setTipResult(null)\n    setDrinkResult(null)\n    setDrinkCmd('idle')\n    setTipCmd('idle')\n    setFlashColor(null)\n    setCoinRainCount(0)\n    setShowParticles(null)\n    setQuestionMode(false)\n  }"
c = c.replace(old3, new3, 1)

# 4. doSpin 시작 - spinning phase에서 drinkCmd만 spin
old4 = "    haptic('light')\n\n    // ─ Compute result immediately ─"
new4 = "    haptic('light')\n    setDrinkCmd('spin')\n    setTipCmd('idle')\n\n    // ─ Compute result immediately ─"
c = c.replace(old4, new4, 1)

# 5. 타임라인 전체 교체
old5 = "    // 1.5 s - DRINK 릴 감속 시작\n    later(() => {\n      setDrinkResult(drink)\n      setPhase('drinkStopping')\n    }, 1500)\n\n    // 2.2 s - DRINK 확정 + TIP 릴 계속 회전\n    later(() => {\n      setPhase('drinkRevealed')\n      playSound('slot_stop')\n      haptic('light')\n      if (drink === 'p100') playSound('siren')\n      else if (drink === 'p70') playSound('warning_beep')\n    }, 2200)\n\n    // 3.0 s - TIP 릴 감속 시작\n    later(() => {\n      setTipResult(tip)\n      setPhase('tipStopping')\n      stopDrumroll()\n      if ((tipTier === 'jackpot' || tipTier === 'high') && store.config.autoBillboard) {\n        setQuestionMode(true)\n      }\n    }, 3000)\n\n    // 3.9 s - TIP 확정 공개\n    later(() => {\n      setPhase('tipRevealed')\n      setQuestionMode(false)\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 3900)"
new5 = "    // 1.4 s - DRINK 릴 감속 시작\n    later(() => {\n      setDrinkResult(drink)\n      setDrinkCmd('decel')\n    }, 1400)\n\n    // 2.8 s - DRINK 착지 확정 + TIP 릴 단독 시작\n    later(() => {\n      setDrinkCmd('revealed')\n      setPhase('drinkRevealed')\n      playSound('slot_stop')\n      haptic('light')\n      if (drink === 'p100') playSound('siren')\n      else if (drink === 'p70') playSound('warning_beep')\n    }, 2800)\n\n    // 3.6 s - TIP 릴 단독 고속 회전 시작\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 3600)\n\n    // 4.4 s - TIP 릴 감속 시작\n    later(() => {\n      setTipResult(tip)\n      setTipCmd('decel')\n    }, 4400)\n\n    // 5.8 s - TIP 착지 확정\n    later(() => {\n      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 5800)"
c = c.replace(old5, new5, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
