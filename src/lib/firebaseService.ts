// Firebase service utilities for stats tracking
import { doc, setDoc, increment, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { SpinResult } from '../types/game'
import { TIP_VALUES } from '../types/game'

export async function recordSpin(result: SpinResult, clubId: string = 'default') {
  const today = new Date().toISOString().split('T')[0]
  const ref = doc(db, 'clubs', clubId, 'sessions', today)
  try {
    await setDoc(ref, {
      totalSpins: increment(1),
      totalTipVND: increment(TIP_VALUES[result.tip]),
      jackpotCount: increment(result.tip === 'jackpot' ? 1 : 0),
      lastUpdated: new Date().toISOString(),
    }, { merge: true })
  } catch (e) {
    // Offline — will sync when reconnected
    console.warn('Firebase offline, spin not recorded')
  }
}

export async function loadClubConfig(clubId: string = 'default') {
  try {
    const ref = doc(db, 'clubs', clubId, 'config', 'main')
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data()
  } catch (e) {}
  return null
}
