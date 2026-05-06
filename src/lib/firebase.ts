// Firebase configuration — Firestore only (Auth replaced with local auth)
import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDEMO-REPLACE-WITH-REAL-KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'lucky-club-master.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'lucky-club-master',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'lucky-club-master.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:123456789:web:abcdef',
}

const app = initializeApp(firebaseConfig)

// Use modern persistent cache API (replaces deprecated enableIndexedDbPersistence)
// Supports multi-tab and offline-first usage
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export default app
