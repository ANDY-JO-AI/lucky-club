import re

with open('src/i18n/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ── Korean tease strings ──────────────────────────────────────────
ko_replacements = {
    r"teaseNothing:\s*'[^']*'": "teaseNothing: '🎰 ㅋㅋㅋ 꽝!! 메롱~ 다음엔 잘 되겠지?'",
    r"teaseLow:\s*'[^']*'":     "teaseLow: '😝 겨우 이거? 50,000₫도 안 되냐고ㅋㅋ 한 판 더!'",
    r"teaseMid:\s*'[^']*'":     "teaseMid: '😏 아쉽다~ 50,000₫ 아슬아슬! 한 번만 더 하면 될 것 같은데?'",
    r"teaseHigh:\s*'[^']*'":    "teaseHigh: '🔥 오오!! 50,000₫ 넘었다!! 역시 한 판 더 했어야지~'",
    r"teaseJackpot:\s*'[^']*'": "teaseJackpot: '💥 JACKPOT!!! 완전 터졌다!!! 오늘 주인공은 너야!!!'"
}

en_replacements = {
    r"teaseNothing:\s*'[^']*'": "teaseNothing: '🎰 BUST! Nope~ Try again loser 😂'",
    r"teaseLow:\s*'[^']*'":     "teaseLow: '😝 That\\'s it?? Under 50,000₫ lmaooo. ONE MORE!'",
    r"teaseMid:\s*'[^']*'":     "teaseMid: '😏 So close to 50k~ Just ONE more spin?'",
    r"teaseHigh:\s*'[^']*'":    "teaseHigh: '🔥 WOAH!! Over 50,000₫!! Keep it going!!'",
    r"teaseJackpot:\s*'[^']*'": "teaseJackpot: '💥 JACKPOT!!! YOU ABSOLUTE LEGEND!!!'"
}

vi_replacements = {
    r"teaseNothing:\s*'[^']*'": "teaseNothing: '🎰 Trượt rồi!! Hehe~ Lần sau nhé thất bại!'",
    r"teaseLow:\s*'[^']*'":     "teaseLow: '😝 Chỉ vậy thôi?? Dưới 50k đó!! Thử lại đi!'",
    r"teaseMid:\s*'[^']*'":     "teaseMid: '😏 Gần 50k rồi~ Một ván nữa thôi là được!'",
    r"teaseHigh:\s*'[^']*'":    "teaseHigh: '🔥 Ồ!! Trên 50,000₫ luôn!! Tiếp tục đi!!'",
    r"teaseJackpot:\s*'[^']*'": "teaseJackpot: '💥 JACKPOT!!! Chúc mừng huyền thoại!!!'"
}

# Split content into ko / en / vi sections and apply replacements per section
def apply_in_section(content, lang_marker, replacements):
    # Find the language block and apply replacements only within it
    # Strategy: find "ko:" or "en:" or "vi:" block, replace within that range
    lines = content.split('\n')
    in_section = False
    depth = 0
    result = []
    section_buf = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        # Detect section start e.g. "  ko: {" or "  en: {"
        if re.match(r'\s+' + lang_marker + r'\s*:\s*\{', line):
            in_section = True
            depth = 1
            result.append(line)
            i += 1
            continue
        
        if in_section:
            for pat, rep in replacements.items():
                line = re.sub(pat, rep, line)
            result.append(line)
            depth += line.count('{') - line.count('}')
            if depth <= 0:
                in_section = False
        else:
            result.append(line)
        i += 1
    
    return '\n'.join(result)

content = apply_in_section(content, 'ko', ko_replacements)
content = apply_in_section(content, 'en', en_replacements)
content = apply_in_section(content, 'vi', vi_replacements)

with open('src/i18n/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS')
