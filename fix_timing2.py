with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# ── 수정 1: 이전 결과 유지 (resetToIdle에서 result를 null로 즉시 초기화 안 함)
# spinButton 클릭 시점에 초기화하도록 doSpin 시작부에서 처리
old1 = "    setDrinkCmd('spin')\n    setTipCmd('idle')"
new1 = "    setDrinkCmd('spin')\n    setTipCmd('idle')\n    setTipResult(null)\n    setDrinkResult(null)"
c = c.replace(old1, new1, 1)

# resetToIdle에서 result null 제거 (이전 결과 화면에 유지)
old2 = "    setDrinkCmd('idle')\n    setTipCmd('idle')\n    setFlashColor(null)"
new2 = "    setDrinkCmd('idle')\n    setTipCmd('idle')\n    setFlashColor(null)\n    // 결과값은 다음 스핀 시작 시 초기화 (이전 결과 화면 유지)"
c = c.replace(old2, new2, 1)

# ── 수정 2: 타이밍 재설계 (총 ~13초 — 프로 카지노 기준)
old3 = "    // 1.4 s - DRINK 릴 감속 시작\n    later(() => {\n      setDrinkResult(drink)\n      setDrinkCmd('decel')\n    }, 1400)\n\n    // 2.8 s - DRINK 착지 확정 + TIP 릴 단독 시작\n    later(() => {\n      setDrinkCmd('revealed')\n      setPhase('drinkRevealed')\n      playSound('slot_stop')\n      haptic('light')\n      if (drink === 'p100') playSound('siren')\n      else if (drink === 'p70') playSound('warning_beep')\n    }, 2800)\n\n    // 3.6 s - TIP 릴 단독 고속 회전 시작\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 3600)\n\n    // 4.4 s - TIP 릴 감속 시작\n    later(() => {\n      setTipResult(tip)\n      setTipCmd('decel')\n    }, 4400)\n\n    // 5.8 s - TIP 착지 확정\n    later(() => {\n      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 5800)"
new3 = "    // 2.0 s - DRINK 릴 감속 시작 (충분한 고속 회전 후)\n    later(() => {\n      setDrinkResult(drink)\n      setDrinkCmd('decel')\n    }, 2000)\n\n    // 5.0 s - DRINK 착지 확정 (감속 3초)\n    later(() => {\n      setDrinkCmd('revealed')\n      setPhase('drinkRevealed')\n      playSound('slot_stop')\n      haptic('light')\n      if (drink === 'p100') playSound('siren')\n      else if (drink === 'p70') playSound('warning_beep')\n    }, 5000)\n\n    // 6.2 s - TIP 릴 단독 고속 회전 시작 (1.2초 압박 정지 후)\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 6200)\n\n    // 8.2 s - TIP 릴 감속 시작 (2초 고속 회전 후)\n    later(() => {\n      setTipResult(tip)\n      setTipCmd('decel')\n    }, 8200)\n\n    // 12.0 s - TIP 착지 확정 (감속 ~3.8초)\n    later(() => {\n      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 12000)"
c = c.replace(old3, new3, 1)

# ── 수정 3: celebration/billboard 타이밍도 맞게 조정
c = c.replace('}, 4400 + celebDelay)', '}, 12800 + celebDelay)')
c = c.replace('}, 5100 + celebDelay)', '}, 13600 + celebDelay)')
c = c.replace('}, 5800 + celebDelay)', '}, 14400 + celebDelay)')
c = c.replace('}, 5500 + celebDelay)', '}, 13200 + celebDelay)')

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
