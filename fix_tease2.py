with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# state 추가
old1 = "  const [questionMode, setQuestionMode]     = useState(false)"
new1 = "  const [questionMode, setQuestionMode]     = useState(false)\n  const [teaseMessage, setTeaseMessage]     = useState<string | null>(null)"
c = c.replace(old1, new1, 1)

# resetToIdle에 teaseMessage 초기화
old2 = "    setQuestionMode(false)\n  }"
new2 = "    setQuestionMode(false)\n    setTeaseMessage(null)\n  }"
c = c.replace(old2, new2, 1)

# JSX — questionMode 텍스트 아래에 teaseMessage 추가
old3 = "        {/* Social proof */}"
new3 = """        {/* 약올리기 / 축하 메시지 */}
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
c = c.replace(old3, new3, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
