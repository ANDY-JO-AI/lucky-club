// ═══════════════════════════════════════════════════════════════
// Lucky Club — Reel Engine v2.0
// 5개 중독 메커니즘 통합:
//   1. Virtual Reel Shuffle     — 매 스핀 순서 무작위화
//   2. Pity System              — 연속 저액 시 고액 보정
//   3. Bounded Tier Reveal      — 티어 심볼 → 금액 카운트업
//   4. Anti-Pattern Detection   — 3연속 동일 구간 강제 차단
//   5. Escalation Tension       — 연속 저액 시 긴장 게이지
// ═══════════════════════════════════════════════════════════════

// ── 1. 가중 확률 테이블 (Virtual Reel Mapping) ──────────────────
// 물리 릴 8칸 → 내부 256 슬롯 가중 테이블
// 숫자가 클수록 해당 결과가 자주 나옴
export const TIP_WEIGHT_TABLE: Record<string, number> = {
  nothing:  55,   // 저주/꽝  — 자주
  t2000:    45,   // 2,000₫  — 자주
  t5000:    35,   // 5,000₫  — 보통
  t10000:   28,   // 10,000₫ — 보통
  t20000:   18,   // 20,000₫ — 가끔
  t50000:   10,   // 50,000₫ — 드물게
  t100000:   5,   // 100,000₫— 희귀
  t150000:   3,   // 150,000₫— 매우 희귀
  t200000:   1,   // 200,000₫— 전설
}

export const DRINK_WEIGHT_TABLE: Record<string, number> = {
  p10:  40,
  p20:  35,
  p30:  30,
  p50:  25,
  p70:  15,
  p100:  5,
}

// 티어 정의 (Bounded Tier Reveal용)
export type TipTier = 'curse' | 'low' | 'mid' | 'high' | 'jackpot'
export const TIP_TIER_MAP: Record<string, TipTier> = {
  nothing:  'curse',
  t2000:    'low',
  t5000:    'low',
  t10000:   'mid',
  t20000:   'mid',
  t50000:   'high',
  t100000:  'high',
  t150000:  'jackpot',
  t200000:  'jackpot',
}

// 티어별 표시 심볼
export const TIER_SYMBOL: Record<TipTier, string> = {
  curse:   '💀',
  low:     '🥉',
  mid:     '🥈',
  high:    '🥇',
  jackpot: '💎',
}

// 티어별 색상
export const TIER_COLOR: Record<TipTier, string> = {
  curse:   '#6b7280',
  low:     '#cd7f32',
  mid:     '#9ca3af',
  high:    '#fbbf24',
  jackpot: '#a855f7',
}

// ── 2. 가중 랜덤 뽑기 함수 ────────────────────────────────────
export function weightedPick(table: Record<string, number>): string {
  const entries = Object.entries(table)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [key, w] of entries) {
    r -= w
    if (r <= 0) return key
  }
  return entries[entries.length - 1][0]
}

// ── 3. Fisher-Yates 셔플 (Virtual Reel 순서 무작위화) ──────────
export function shuffleReel<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 4. Anti-Pattern: 직전 2회 결과 기억 → 3연속 동일 티어 차단 ─
export function antiPatternFilter(
  pick: string,
  history: string[],
  table: Record<string, number>
): string {
  if (history.length < 2) return pick

  const tierOf = (k: string) => TIP_TIER_MAP[k] ?? k
  const lastTier  = tierOf(history[history.length - 1])
  const prev2Tier = tierOf(history[history.length - 2])

  // 2연속 동일 티어 → 이번에도 같은 티어면 재뽑기 (최대 5회)
  if (tierOf(pick) === lastTier && lastTier === prev2Tier) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const retry = weightedPick(table)
      if (tierOf(retry) !== lastTier) return retry
    }
  }
  return pick
}

// ── 5. Pity System ────────────────────────────────────────────
// pityCnt: 연속 저액(mid 이하) 횟수
// 4회 연속 저액 → 5번째는 반드시 high 이상 보정
export function applyPity(
  pick: string,
  pityCnt: number,
  table: Record<string, number>
): string {
  if (pityCnt < 4) return pick
  const tier = TIP_TIER_MAP[pick]
  if (tier === 'high' || tier === 'jackpot') return pick

  // 강제로 high 이상 뽑기
  const highPool: Record<string, number> = {
    t50000:  50,
    t100000: 35,
    t150000: 12,
    t200000:  3,
  }
  return weightedPick(highPool)
}

// ── 6. 통합 스핀 결과 생성 ────────────────────────────────────
export interface SpinResult {
  tip:       string
  drink:     string
  tipTier:   TipTier
  tipAmount: number          // 실제 금액 (카운트업용)
  pityCnt:   number          // 업데이트된 pity 카운터
  escalation: number         // 0-4: 긴장 게이지 레벨
  shuffledTipReel:   string[] // 매 스핀 셔플된 릴 순서
  shuffledDrinkReel: string[] // 매 스핀 셔플된 릴 순서
}

export const TIP_AMOUNT: Record<string, number> = {
  nothing:  0,
  t2000:    2000,
  t5000:    5000,
  t10000:   10000,
  t20000:   20000,
  t50000:   50000,
  t100000:  100000,
  t150000:  150000,
  t200000:  200000,
}

// 기본 릴 배열 (셔플 전 원본)
export const BASE_TIP_REEL   = ['nothing','t2000','t5000','t10000','t20000','t50000','t100000','t150000','t200000']
export const BASE_DRINK_REEL = ['p10','p20','p30','p50','p70','p100']

export function generateSpin(
  prevHistory: string[],
  prevPityCnt: number,
  prevEscalation: number
): SpinResult {
  // 1) 가중 뽑기
  let tip   = weightedPick(TIP_WEIGHT_TABLE)
  const drink = weightedPick(DRINK_WEIGHT_TABLE)

  // 2) Anti-Pattern 필터
  tip = antiPatternFilter(tip, prevHistory, TIP_WEIGHT_TABLE)

  // 3) Pity 보정
  tip = applyPity(tip, prevPityCnt, TIP_WEIGHT_TABLE)

  const tipTier   = TIP_TIER_MAP[tip] ?? 'low'
  const tipAmount = TIP_AMOUNT[tip] ?? 0

  // 4) Pity 카운터 업데이트
  const isLow = tipTier === 'curse' || tipTier === 'low' || tipTier === 'mid'
  const newPityCnt = isLow ? prevPityCnt + 1 : 0

  // 5) Escalation 레벨 업데이트 (0-4)
  //    저액 연속 시 1씩 증가, 고액 시 0으로 리셋
  const newEscalation = isLow
    ? Math.min(prevEscalation + 1, 4)
    : 0

  // 6) Virtual Reel Shuffle
  const shuffledTipReel   = shuffleReel(BASE_TIP_REEL)
  const shuffledDrinkReel = shuffleReel(BASE_DRINK_REEL)

  return {
    tip,
    drink,
    tipTier,
    tipAmount,
    pityCnt:   newPityCnt,
    escalation: newEscalation,
    shuffledTipReel,
    shuffledDrinkReel,
  }
}
