import re

with open("src/i18n/index.ts", "r", encoding="utf-8") as f:
    c = f.read()

# teaseJackpot 줄 끝에 쉼표 없는 경우 추가 (3개 언어 블록 모두)
# 패턴: teaseJackpot: '...' 뒤에 줄바꿈이 오는 경우 쉼표 삽입
c = re.sub(
    r"(teaseJackpot:\s*'[^']*')(\s*\n\s*holdForJackpot)",
    r"\1,\2",
    c
)

with open("src/i18n/index.ts", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
