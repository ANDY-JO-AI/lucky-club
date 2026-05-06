with open('src/i18n/index.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 한국어
old_ko = "    tapToDismiss: '탭하여 닫기',"
new_ko = """    tapToDismiss: '탭하여 닫기',
    teaseNothing: '😂 꽝이잖아ㅋㅋ 다음엔 잘 되겠지~',
    teaseLow: '겨우 이거?ㅋㅋ 한 번 더 해봐~ 🎰',
    teaseMid: '5만₫ 아래네~ 아쉽다! 한 판 더? 😏',
    teaseHigh: '🔥 오!! 대박! 5만₫ 이상이다!',
    teaseJackpot: '💥 JACKPOT!! 축하합니다!!!',"""
c = c.replace(old_ko, new_ko, 1)

# 영어
old_en = "    tapToDismiss: 'Tap to dismiss',"
new_en = """    tapToDismiss: 'Tap to dismiss',
    teaseNothing: '😂 Nothing! Better luck next time~',
    teaseLow: 'That all? Come on, try again! 🎰',
    teaseMid: 'Under 50k~ So close! One more? 😏',
    teaseHigh: '🔥 Nice!! Over 50,000₫!',
    teaseJackpot: '💥 JACKPOT!! Congratulations!!!',"""
c = c.replace(old_en, new_en, 1)

# 베트남어
old_vi = "    tapToDismiss: 'Chạm để tắt',"
new_vi = """    tapToDismiss: 'Chạm để tắt',
    teaseNothing: '😂 Trượt rồi! Lần sau nhé~',
    teaseLow: 'Chỉ vậy thôi? Thử lại đi! 🎰',
    teaseMid: 'Dưới 50k~ Tiếc quá! Một ván nữa? 😏',
    teaseHigh: '🔥 Ồ!! Trên 50,000₫ luôn!',
    teaseJackpot: '💥 JACKPOT!! Xin chúc mừng!!!',"""
c = c.replace(old_vi, new_vi, 1)

with open('src/i18n/index.ts', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
