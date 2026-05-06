// Main App component with routing
import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useGameStore } from './store/gameStore'
import { initSounds, setMasterVolume, setMuted } from './lib/sounds'
import LanguageSelect from './pages/LanguageSelect'
import GameScreen from './pages/GameScreen'

const AdminPage = lazy(() => import('./pages/AdminPage'))

export default function App() {
  const { languageSelected, isMuted, volume } = useGameStore()

  useEffect(() => {
    initSounds()
  }, [])

  useEffect(() => {
    setMuted(isMuted)
  }, [isMuted])

  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111',
            color: '#FFD700',
            border: '1px solid #FFD700',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 700,
            fontSize: '14px',
          },
          duration: 2500,
        }}
      />
      <Routes>
        <Route path="/admin/*" element={
          <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-gold font-bebas text-4xl">LOADING...</div>}>
            <AdminPage />
          </Suspense>
        } />
        <Route path="*" element={
          !languageSelected ? <LanguageSelect /> : <GameScreen />
        } />
      </Routes>
    </BrowserRouter>
  )
}
