with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('}, 5700 + celebDelay)', '}, 4400 + celebDelay)', 1)
c = c.replace('}, 5000 + celebDelay)', '}, 5100 + celebDelay)')
c = c.replace('}, 5700 + celebDelay)', '}, 5800 + celebDelay)')
c = c.replace('}, 5200 + celebDelay)', '}, 5500 + celebDelay)')

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('SUCCESS')
