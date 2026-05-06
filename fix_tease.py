with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# ── 수정 1: drinkRevealed 구간에서 약올리기 텍스트 ON
old1 = "    // 6.2 s - TIP 릴 단독 고속 회전 시작 (1.2초 압박 정지 후)\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 6200)"
new1 = "    // 5.8 s - 약올리기 텍스트 시작\n    later(() => {\n      setQuestionMode(true)\n    }, 5800)\n\n    // 6.5 s - TIP 릴 단독 고속 회전 시작\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 6500)"
c = c.replace(old1, new1, 1)

# ── 수정 2: TIP 감속 시작 타이밍 (고속 2초 확보)
old2 = "    // 8.2 s - TIP 릴 감속 시작 (2초 고속 회전 후)\n    later(() => {\n      setTipResult(tip)\n      setTipCmd('decel')\n    }, 8200)"
new2 = "    // 8.5 s - TIP 릴 감속 시작 (2초 고속 회전 후)\n    later(() => {\n      setTipResult(tip)\n      setTipCmd('decel')\n    }, 8500)"
c = c.replace(old2, new2, 1)

# ── 수정 3: TIP 착지 타이밍 조정 (감속 5.5초 + 여유)
old3 = "    // 12.0 s - TIP 착지 확정 (감속 ~3.8초)\n    later(() => {\n      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 12000)"
new3 = "    // 14.5 s - TIP 착지 확정 (감속 ~6초 — 약올리기 최고조 후)\n    later(() => {\n      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setQuestionMode(false)\n      setNearMissTip(null)\n      setNearMissDrink(null)\n      playSound('slot_stop')\n      haptic('light')\n    }, 14500)"
c = c.replace(old3, new3, 1)

# ── 수정 4: celebration/billboard 타이밍 조정
c = c.replace('}, 12800 + celebDelay)', '}, 15300 + celebDelay)')
c = c.replace('}, 13600 + celebDelay)', '}, 16100 + celebDelay)')
c = c.replace('}, 14400 + celebDelay)', '}, 16900 + celebDelay)')
c = c.replace('}, 13200 + celebDelay)', '}, 15700 + celebDelay)')

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
