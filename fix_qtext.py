with open('src/pages/GameScreen.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''              ???'''
new = '''              💰 TIP...?!'''
c = c.replace(old, new, 1)

with open('src/pages/GameScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('SUCCESS')
