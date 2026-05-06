with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# mid-high 케이스에 축하 메시지 추가
old1 = "        case 'mid-high':\n          triggerFlash('#FFD700', 1)\n          playSound('fanfare_short')\n          haptic('medium')\n          setCoinRainCount(20)\n          setShowParticles('gold')\n          break"
new1 = "        case 'mid-high':\n          triggerFlash('#FFD700', 1)\n          playSound('fanfare_short')\n          haptic('medium')\n          setCoinRainCount(20)\n          setShowParticles('gold')\n          later(() => setTeaseMessage(t('teaseHigh')), 200)\n          later(() => setTeaseMessage(null), 3500)\n          break"
c = c.replace(old1, new1, 1)

# high 케이스에 축하 메시지 추가
old2 = "        case 'high':\n          triggerFlash('#FFD700', 3)\n          playSound('fanfare_long')\n          haptic('strong')\n          setCoinRainCount(50)\n          setShowParticles('gold')\n          break"
new2 = "        case 'high':\n          triggerFlash('#FFD700', 3)\n          playSound('fanfare_long')\n          haptic('strong')\n          setCoinRainCount(50)\n          setShowParticles('gold')\n          later(() => setTeaseMessage(t('teaseHigh')), 200)\n          later(() => setTeaseMessage(null), 3500)\n          break"
c = c.replace(old2, new2, 1)

# jackpot 케이스에 잭팟 메시지 추가
old3 = "          store.incrementJackpot()\n          store.resetEscalation()"
new3 = "          store.incrementJackpot()\n          store.resetEscalation()\n          later(() => setTeaseMessage(t('teaseJackpot')), 300)\n          later(() => setTeaseMessage(null), 4000)"
c = c.replace(old3, new3, 1)

# curse 케이스에 약올리기 추가 (기존 없으면)
old4 = "        case 'curse':\n          triggerFlash('#FF0000', 3)\n          playSound('sad_trombone')\n          haptic('strong')\n          setShowParticles('skull')\n          break"
new4 = "        case 'curse':\n          triggerFlash('#FF0000', 3)\n          playSound('sad_trombone')\n          haptic('strong')\n          setShowParticles('skull')\n          later(() => setTeaseMessage(t('teaseCurse')), 200)\n          later(() => setTeaseMessage(null), 3500)\n          break"
c = c.replace(old4, new4, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
