import re

# CP949로 읽기 (현재 파일 인코딩)
try:
    with open('src/i18n/index.ts', 'r', encoding='cp949') as f:
        content = f.read()
except:
    with open('src/i18n/index.ts', 'r', encoding='utf-8') as f:
        content = f.read()

# tease 키 전체 라인 제거 (중복 포함 전부 삭제)
tease_keys = ['teaseNothing', 'teaseLow', 'teaseMid', 'teaseCurse', 'teaseHigh', 'teaseJackpot']
lines = content.split('\n')
cleaned = [l for l in lines if not any(k + ':' in l for k in tease_keys)]
content = '\n'.join(cleaned)

# tapToDismiss 뒤에 tease 블록 삽입 (언어별 1회씩)
ko_block = """    tapToDismiss: '탭하여 닫기',
    teaseNothing: '🎰 ㅋㅋㅋ 꽝!! 메롱~ 😜 다음 판엔 나올지도?',
    teaseLow: '😝 겨우 이거? 50,000₫도 안 되냐고ㅋㅋ 한 판 더!',
    teaseMid: '😏 아쉽다~ 50,000₫ 바로 앞에서 탈락! 억울하면 한 판 더?',
    teaseCurse: '💀 저주 걸렸다ㅋㅋㅋ 메롱~ 😜 다음엔 잘 되겠지?',
    teaseHigh: '🔥🔥 오!! 50,000₫ 이상!! 오늘 운 좋은데?!',
    teaseJackpot: '💥👑 JACKPOT!!! 축하해요!! 오늘 주인공이네!!'"""

en_block = """    tapToDismiss: 'Tap to dismiss',
    teaseNothing: '🎰 LMAO Nothing!! Nah nah~ 😜 Maybe next spin?',
    teaseLow: '😝 That tiny amount? Under 50,000₫?? Try again loser!',
    teaseMid: '😏 So close to 50,000₫... but NOPE! Mad? Play again!',
    teaseCurse: '💀 Cursed!! Hahaha~ 😜 Better luck next time!',
    teaseHigh: '🔥🔥 WOAH!! Over 50,000₫!! You got lucky today!',
    teaseJackpot: '💥👑 JACKPOT!!! CONGRATULATIONS!! You are the star!!'"""

vi_block = """    tapToDismiss: 'Chạm để tắt',
    teaseNothing: '🎰 Hahaha Trượt!! Thè lưỡi~ 😜 Ván sau may hơn nhé?',
    teaseLow: '😝 Chỉ vậy thôi? Dưới 50,000₫ à?? Chơi lại đi!',
    teaseMid: '😏 Gần 50,000₫ lắm rồi... mà KHÔNG! Tức không? Chơi tiếp!',
    teaseCurse: '💀 Bị nguyền rủa rồi~ 😜 Lần sau sẽ khác!',
    teaseHigh: '🔥🔥 Ồ!! Trên 50,000₫!! Hôm nay may mắn đấy!',
    teaseJackpot: '💥👑 JACKPOT!!! CHÚC MỪNG!! Bạn là ngôi sao hôm nay!!'"""

content = content.replace("    tapToDismiss: '탭하여 닫기',", ko_block, 1)
content = content.replace("    tapToDismiss: 'Tap to dismiss',", en_block, 1)
content = content.replace("    tapToDismiss: 'Chạm để tắt',", vi_block, 1)

# UTF-8로 저장 (이후 PowerShell에서도 정상 출력)
with open('src/i18n/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS')
