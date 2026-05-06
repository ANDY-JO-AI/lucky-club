with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 기존 teaseMessage JSX 블록 제거
old1 = """        {/* 약올리기 / 축하 메시지 */}
        <AnimatePresence>
          {teaseMessage && (
            <motion.div
              key="tease"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="font-noto font-extrabold text-center text-lg px-5 py-3 rounded-2xl border-2"
              style={{
                borderColor: teaseMessage.includes('😂') || teaseMessage.includes('ㅋ') || teaseMessage.includes('ha') ? '#ef4444' : '#FFD700',
                background:  teaseMessage.includes('😂') || teaseMessage.includes('ㅋ') || teaseMessage.includes('ha') ? '#ef444422' : '#FFD70022',
                color:       teaseMessage.includes('😂') || teaseMessage.includes('ㅋ') || teaseMessage.includes('ha') ? '#ef4444' : '#FFD700',
                boxShadow:   teaseMessage.includes('😂') || teaseMessage.includes('ㅋ') || teaseMessage.includes('ha') ? '0 0 20px #ef444455' : '0 0 20px #FFD70055',
              }}
            >
              {teaseMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social proof */}"""
new1 = "        {/* Social proof */}"
c = c.replace(old1, new1, 1)

# ScreenFlash 바로 아래에 전체화면 고정 teaseMessage 오버레이 삽입
old2 = "      {/* Coin rain */}"
new2 = """      {/* 약올리기 / 축하 메시지 — 화면 상단 고정 오버레이 */}
      <AnimatePresence>
        {teaseMessage && (
          <motion.div
            key="tease-overlay"
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: [0.8, 1.1, 1] }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className="fixed top-16 inset-x-4 z-[9995] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ rotate: [-1, 1, -1, 1, 0] }}
              transition={{ duration: 0.4, repeat: 2 }}
              className="w-full max-w-sm font-noto font-extrabold text-center text-base px-5 py-3 rounded-2xl border-2"
              style={{
                borderColor: teaseMessage.includes('🔥') || teaseMessage.includes('💥') || teaseMessage.includes('👑') ? '#FFD700' : '#ef4444',
                background:  teaseMessage.includes('🔥') || teaseMessage.includes('💥') || teaseMessage.includes('👑') ? '#1a1200' : '#1a0000',
                color:       teaseMessage.includes('🔥') || teaseMessage.includes('💥') || teaseMessage.includes('👑') ? '#FFD700' : '#ef4444',
                boxShadow:   teaseMessage.includes('🔥') || teaseMessage.includes('💥') || teaseMessage.includes('👑') ? '0 0 28px #FFD70088' : '0 0 28px #ef444488',
              }}
            >
              {teaseMessage}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coin rain */}"""
c = c.replace(old2, new2, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
