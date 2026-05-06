with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# ── 수정 1: import에 startTipTension, stopTipTension 추가
old1 = "import { startDrumroll, stopDrumroll, playSound, haptic, torchStrobe } from '../lib/sounds'"
new1 = "import { startDrumroll, stopDrumroll, startTipTension, stopTipTension, playSound, haptic, torchStrobe } from '../lib/sounds'"
c = c.replace(old1, new1, 1)

# ── 수정 2: TIP 릴 단독 회전 시작 시 TIP 긴장 BGM 시작
old2 = "    // 6.5 s - TIP 릴 단독 고속 회전 시작\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n    }, 6500)"
new2 = "    // 6.5 s - TIP 릴 단독 고속 회전 시작 + 긴장 BGM\n    later(() => {\n      setTipCmd('spin')\n      stopDrumroll()\n      startTipTension()\n    }, 6500)"
c = c.replace(old2, new2, 1)

# ── 수정 3: TIP 착지 시 긴장 BGM 중단
old3 = "      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setQuestionMode(false)"
new3 = "      setTipCmd('revealed')\n      setPhase('tipRevealed')\n      setQuestionMode(false)\n      stopTipTension()"
c = c.replace(old3, new3, 1)

# ── 수정 4: resetToIdle에도 stopTipTension 추가
old4 = "    setDrinkCmd('idle')\n    setTipCmd('idle')\n    setFlashColor(null)"
new4 = "    setDrinkCmd('idle')\n    setTipCmd('idle')\n    stopTipTension()\n    setFlashColor(null)"
c = c.replace(old4, new4, 1)

# ── 수정 5: celebration 구간 — 5만 VND 기준 약올리기/축하 이펙트
# 기존 'mid' 케이스 찾아서 약올리기 텍스트 추가
old5 = "        case 'nothing':\n          triggerFlash('#222222', 1)\n          playSound('sad_trombone')\n          break"
new5 = "        case 'nothing':\n          triggerFlash('#222222', 1)\n          playSound('sad_trombone')\n          haptic('medium')\n          later(() => setTeaseMessage(t('teaseNothing')), 200)\n          later(() => setTeaseMessage(null), 3000)\n          break"
c = c.replace(old5, new5, 1)

old6 = "        case 'low':\n          triggerFlash('#FFFFFF', 1)\n          playSound('coin_single')\n          break"
new6 = "        case 'low':\n          triggerFlash('#FFFFFF', 1)\n          playSound('coin_single')\n          later(() => setTeaseMessage(t('teaseLow')), 200)\n          later(() => setTeaseMessage(null), 3000)\n          break"
c = c.replace(old6, new6, 1)

old7 = "        case 'mid':\n          triggerFlash('#C0C0C0', 1)\n          playSound('coin_cascade')\n          setCoinRainCount(5)\n          break"
new7 = "        case 'mid':\n          triggerFlash('#C0C0C0', 1)\n          playSound('coin_cascade')\n          setCoinRainCount(5)\n          later(() => setTeaseMessage(t('teaseMid')), 200)\n          later(() => setTeaseMessage(null), 3000)\n          break"
c = c.replace(old7, new7, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
