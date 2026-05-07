with open("src/components/SlotReel.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# buildWindow 함수 닫기 괄호 누락 수정
old_build = """function buildWindow(order: readonly string[], topIdx: number): string[] {
  return Array.from({ length: VISIBLE }, (_, i) =>
    order[(topIdx + i) % order.length]
function topForCenter"""

new_build = """function buildWindow(order: readonly string[], topIdx: number): string[] {
  return Array.from({ length: VISIBLE }, (_, i) =>
    order[(topIdx + i) % order.length]
  )
}
function topForCenter"""

if old_build in c:
    c = c.replace(old_build, new_build, 1)
    print("SUCCESS")
else:
    print("MATCH_FAILED")

with open("src/components/SlotReel.tsx", "w", encoding="utf-8") as f:
    f.write(c)
