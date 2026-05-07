with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

old_fn = """  function drinkToSymbol(key: string): string {
    if (key === 'p100')   return '\U0001f4a5'
    if (key === 'p70')    return '\U0001f525'
    if (key === 'p50')    return '\U0001f37a'
    if (key === 'p25')    return '\U0001f964'
    if (key === 'respin') return '\U0001f504'
    return '\U0001f376'
  }"""

if old_fn in c:
    c = c.replace(old_fn, "", 1)
    print("SUCCESS")
else:
    # 줄 단위 제거 fallback
    lines = c.split("\n")
    new_lines = []
    skip = False
    for line in lines:
        if "function drinkToSymbol" in line:
            skip = True
        if skip:
            new_lines.append("")
            if line.strip() == "}":
                skip = False
        else:
            new_lines.append(line)
    c = "\n".join(new_lines)
    print("SUCCESS - fallback")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
