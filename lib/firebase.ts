import { initializeApp, getApps, getApp as fbGetApp, FirebaseApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Firebase client SDK must only run in the browser.
function resolveApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    return {} as FirebaseApp
  }
  return getApps().length ? fbGetApp() : initializeApp(firebaseConfig)
}

const app = resolveApp()

export const db: Firestore = typeof window !== 'undefined' ? getFirestore(app) : {} as Firestore
