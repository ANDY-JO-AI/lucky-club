// Admin Dashboard — Local Auth (no Firebase Auth dependency)
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  adminLogin,
  adminLogout,
  getAdminSession,
  changeAdminPassword,
  changeAdminEmail,
  getAdminEmail,
  DEFAULT_CREDENTIALS,
} from '../lib/localAuth'
import { useGameStore } from '../store/gameStore'
import { DEFAULT_CONFIG, DEFAULT_TIP_WEIGHTS, DEFAULT_DRINK_WEIGHTS } from '../types/game'
import type { ClubConfig, Mission } from '../types/game'
import { DEFAULT_MISSIONS_KARAOKE } from '../lib/missions'
import {
  BarChart2, Settings2, BookOpen, LogOut, ChevronLeft,
  Plus, Trash2, Edit3, Save, RotateCcw, KeyRound, Eye, EyeOff,
} from 'lucide-react'

// ─── Auth Gate ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  // null = not logged in, string = logged-in email
  const [adminEmail, setAdminEmail] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    // Check sessionStorage on mount (instant, no network)
    const session = getAdminSession()
    setAdminEmail(session)
  }, [])

  const handleLoginSuccess = (email: string) => setAdminEmail(email)
  const handleLogout = () => {
    adminLogout()
    setAdminEmail(null)
  }

  if (adminEmail === undefined) return <AdminLoader />
  if (!adminEmail) return <AdminLogin onSuccess={handleLoginSuccess} />
  return <AdminDashboard email={adminEmail} onLogout={handleLogout} />
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function AdminLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full"
      />
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Small timeout so UI updates before synchronous work
    setTimeout(() => {
      const err = adminLogin(email.trim(), password)
      if (err) {
        setError(err)
        setLoading(false)
      } else {
        onSuccess(email.trim().toLowerCase())
      }
    }, 80)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="font-bebas text-4xl text-[#FFD700] tracking-widest neon-gold">
            ADMIN
          </h1>
          <p className="text-white/30 font-noto text-xs mt-1">Lucky Club Master</p>
        </div>

        {/* Default credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-5 p-3 rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5"
        >
          <p className="text-[#FFD700]/70 font-noto text-xs text-center leading-relaxed">
            🔑 기본 계정<br />
            <span className="font-bold text-[#FFD700]">{DEFAULT_CREDENTIALS.email}</span>
            <br />
            <span className="font-bold text-[#FFD700]">{DEFAULT_CREDENTIALS.password}</span>
          </p>
        </motion.div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="username"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-noto outline-none focus:border-[#FFD700] transition-colors"
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white font-noto outline-none focus:border-[#FFD700] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm font-noto text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !email || !password}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl bg-[#FFD700] font-bebas text-2xl text-black tracking-widest disabled:opacity-50 transition-opacity"
          >
            {loading ? '...' : '로그인'}
          </motion.button>

          <a href="/" className="text-center text-white/30 text-sm font-noto hover:text-white/50 transition-colors">
            ← 게임으로 돌아가기
          </a>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type AdminTab = 'stats' | 'probs' | 'missions' | 'settings'

function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [activeTab, setActiveTab]   = useState<AdminTab>('stats')
  const setStoreConfig = useGameStore(s => s.setConfig)
  const [config, setConfig]         = useState<ClubConfig>(DEFAULT_CONFIG)
  const [savedConfig, setSavedConfig] = useState<ClubConfig>(DEFAULT_CONFIG)
  const [loading, setLoading]       = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load config from localStorage (no Firebase dependency)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lucky-club-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.config) {
          setConfig(parsed.state.config)
          setSavedConfig(parsed.state.config)
        }
      }
    } catch {}
    setLoading(false)
  }, [])

const saveConfig = () => {
  setSaveStatus('saving')
  try {
    setStoreConfig(config)
    const raw = localStorage.getItem('lucky-club-storage')
    const parsed = raw ? JSON.parse(raw) : { state: {} }
    if (!parsed.state) parsed.state = {}
    parsed.state.config = config
    localStorage.setItem('lucky-club-storage', JSON.stringify(parsed))
    setSavedConfig(config)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  } catch {
    setSaveStatus('idle')
  }
}

  const tabs: { id: AdminTab; icon: React.ReactNode; label: string }[] = [
    { id: 'stats',    icon: <BarChart2 size={18} />,  label: '통계'      },
    { id: 'probs',    icon: <Settings2 size={18} />,  label: '확률'      },
    { id: 'missions', icon: <BookOpen size={18} />,   label: '미션'      },
    { id: 'settings', icon: <Settings2 size={18} />,  label: '설정'      },
  ]

  const showSave = activeTab === 'probs' || activeTab === 'settings'

  if (loading) return <AdminLoader />

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl bg-white/10">
            <ChevronLeft size={18} />
          </a>
          <div>
            <h1 className="font-bebas text-2xl text-[#FFD700] tracking-wider leading-none">ADMIN</h1>
            <p className="text-white/30 font-noto text-xs">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSave && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveConfig}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-noto font-bold text-sm transition-all ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#FFD700] text-black'
              }`}
            >
              <Save size={14} />
              {saveStatus === 'saving' ? '저장 중…' : saveStatus === 'saved' ? '저장됨 ✓' : '저장'}
            </motion.button>
          )}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-white/10"
            title="로그아웃"
          >
            <LogOut size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 font-noto font-bold text-xs whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[#FFD700] text-[#FFD700]'
                : 'border-transparent text-white/40'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatsTab />
            </motion.div>
          )}
          {activeTab === 'probs' && (
            <motion.div key="probs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProbsTab config={config} setConfig={setConfig} />
            </motion.div>
          )}
          {activeTab === 'missions' && (
            <motion.div key="missions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MissionsTab />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsTab config={config} setConfig={setConfig} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState({ totalSpins: 0, totalTipVND: 0, jackpotCount: 0 })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const ref   = doc(db, 'clubs', 'default', 'sessions', today)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setStats(snap.data() as typeof stats)
    }, () => {})
    return unsub
  }, [])

  const cards = [
    { label: '오늘 총 스핀',    value: stats.totalSpins,                              icon: '🎰', color: '#FFD700' },
    { label: '오늘 팁 합계',    value: `${stats.totalTipVND.toLocaleString()}₫`,      icon: '💰', color: '#39FF14' },
    { label: '오늘 잭팟 횟수',  value: stats.jackpotCount,                            icon: '💥', color: '#FF69B4' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5"
          >
            <span className="text-4xl">{c.icon}</span>
            <div>
              <p className="text-white/50 text-xs font-noto">{c.label}</p>
              <p className="font-bebas text-3xl" style={{ color: c.color }}>{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="font-noto font-bold text-white/50 text-xs mb-3">오늘의 활동</h3>
        <p className="font-noto text-white/30 text-sm text-center py-4">
          Firebase 연결 후 차트가 표시됩니다
        </p>
      </div>
    </div>
  )
}

// ─── Probs Tab ────────────────────────────────────────────────────────────────
function ProbsTab({
  config, setConfig,
}: {
  config: ClubConfig
  setConfig: React.Dispatch<React.SetStateAction<ClubConfig>>
}) {
  const tipKeys: (keyof typeof config.tipWeights)[] = [
    'nothing','w1k','w2k','w5k','w10k','w20k','w50k','w100k','w200k','jackpot',
  ]
  const tipLabels = ['꽝', '1K₫ 💀', '2K₫ 💀', '5K₫ 💀', '10K₫', '20K₫', '50K₫', '100K₫', '200K₫', '500K₫ 💥']

  const drinkKeys: (keyof typeof config.drinkWeights)[] = ['p25','p50','p70','p100','respin']
  const drinkLabels = ['25% 한모금', '50% 반잔', '70% 칠할', '100% 원샷', '🔄 한번더']

  const tipTotal   = tipKeys.reduce((s, k) => s + config.tipWeights[k], 0)
  const drinkTotal = drinkKeys.reduce((s, k) => s + config.drinkWeights[k], 0)

  const updateTip   = (key: keyof typeof config.tipWeights,   val: number) =>
    setConfig(c => ({ ...c, tipWeights:   { ...c.tipWeights,   [key]: val } }))
  const updateDrink = (key: keyof typeof config.drinkWeights, val: number) =>
    setConfig(c => ({ ...c, drinkWeights: { ...c.drinkWeights, [key]: val } }))

  const resetTip   = () => setConfig(c => ({ ...c, tipWeights:   DEFAULT_TIP_WEIGHTS }))
  const resetDrink = () => setConfig(c => ({ ...c, drinkWeights: DEFAULT_DRINK_WEIGHTS }))

  return (
    <div className="flex flex-col gap-6">
      {/* TIP weights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bebas text-xl text-[#FFD700] tracking-wider">💰 TIP 슬롯</h3>
          <div className="flex items-center gap-2">
            <span className={`font-bebas text-lg ${Math.abs(tipTotal - 100) > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
              {tipTotal.toFixed(1)}%
            </span>
            <button onClick={resetTip} className="p-1.5 rounded-lg bg-white/10" title="초기화">
              <RotateCcw size={14} className="text-white/60" />
            </button>
          </div>
        </div>
        {Math.abs(tipTotal - 100) > 0.5 && (
          <p className="text-red-400 text-xs font-noto mb-2">⚠️ 합계가 100%여야 합니다 (현재 {tipTotal.toFixed(1)}%)</p>
        )}
        {tipKeys.map((key, i) => (
          <WeightSlider
            key={key}
            label={tipLabels[i]}
            value={config.tipWeights[key]}
            onChange={v => updateTip(key, v)}
            color={key === 'jackpot' ? '#FFD700' : (key === 'nothing' || key === 'w1k' || key === 'w2k' || key === 'w5k') ? '#FF4444' : '#4FC3F7'}
          />
        ))}
      </div>

      {/* DRINK weights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bebas text-xl text-[#4FC3F7] tracking-wider">🍺 DRINK 슬롯</h3>
          <div className="flex items-center gap-2">
            <span className={`font-bebas text-lg ${Math.abs(drinkTotal - 100) > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
              {drinkTotal.toFixed(1)}%
            </span>
            <button onClick={resetDrink} className="p-1.5 rounded-lg bg-white/10" title="초기화">
              <RotateCcw size={14} className="text-white/60" />
            </button>
          </div>
        </div>
        {drinkKeys.map((key, i) => (
          <WeightSlider
            key={key}
            label={drinkLabels[i]}
            value={config.drinkWeights[key]}
            onChange={v => updateDrink(key, v)}
            color={key === 'p100' ? '#FF4500' : key === 'respin' ? '#39FF14' : '#4FC3F7'}
          />
        ))}
      </div>
    </div>
  )
}

function WeightSlider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="font-noto text-white/70 text-sm w-28 flex-shrink-0">{label}</span>
      <input
        type="range"
        min={0} max={50} step={0.5}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1"
        style={{ accentColor: color }}
      />
      <span className="font-bebas text-base w-12 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  )
}

// ─── Missions Tab ─────────────────────────────────────────────────────────────
type MissionMode  = 'karaoke' | 'adult'
type MissionLevel = 'level1'  | 'level2' | 'level3'

function MissionsTab() {
  const [mode, setMode]   = useState<MissionMode>('karaoke')
  const [level, setLevel] = useState<MissionLevel>('level1')
  const [missions, setMissions] = useState<Record<MissionMode, Record<MissionLevel, Mission[]>>>({
    karaoke: {
      level1: DEFAULT_MISSIONS_KARAOKE.level1,
      level2: DEFAULT_MISSIONS_KARAOKE.level2,
      level3: DEFAULT_MISSIONS_KARAOKE.level3,
    },
    adult: { level1: [], level2: [], level3: [] },
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText,  setEditText]  = useState({ ko: '', en: '', vi: '' })
  const [showAdd,   setShowAdd]   = useState(false)
  const [newMission, setNewMission] = useState({ ko: '', en: '', vi: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadMissions = async () => {
      try {
        const ref  = doc(db, 'clubs', 'default', 'missions', 'all')
        const snap = await getDoc(ref)
        if (snap.exists()) setMissions(snap.data() as typeof missions)
      } catch {}
    }
    loadMissions()
  }, [])

  const currentList = missions[mode][level]

  const saveMissions = useCallback(async (updated: typeof missions) => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'clubs', 'default', 'missions', 'all'), updated)
    } catch {} finally {
      setSaving(false)
    }
  }, [])

  const handleDelete = (id: string) => {
    const updated = {
      ...missions,
      [mode]: {
        ...missions[mode],
        [level]: missions[mode][level].filter(m => m.id !== id),
      },
    }
    setMissions(updated)
    saveMissions(updated)
  }

  const handleEditStart = (m: Mission) => {
    setEditingId(m.id)
    setEditText({ ko: m.text_ko, en: m.text_en, vi: m.text_vi })
  }

  const handleEditSave = () => {
    if (!editingId) return
    const updated = {
      ...missions,
      [mode]: {
        ...missions[mode],
        [level]: missions[mode][level].map(m =>
          m.id === editingId
            ? { ...m, text_ko: editText.ko, text_en: editText.en, text_vi: editText.vi }
            : m
        ),
      },
    }
    setMissions(updated)
    saveMissions(updated)
    setEditingId(null)
  }

  const handleAdd = () => {
    const id = `${mode}-${level}-${Date.now()}`
    const m: Mission = {
      id,
      text_ko: newMission.ko,
      text_en: newMission.en || newMission.ko,
      text_vi: newMission.vi || newMission.ko,
      active: true,
    }
    const updated = {
      ...missions,
      [mode]: {
        ...missions[mode],
        [level]: [...missions[mode][level], m],
      },
    }
    setMissions(updated)
    saveMissions(updated)
    setNewMission({ ko: '', en: '', vi: '' })
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['karaoke', 'adult'] as MissionMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl font-noto font-bold text-sm border transition-all ${
              mode === m ? 'border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700]' : 'border-white/20 text-white/50'
            }`}
          >
            {m === 'karaoke' ? '🎤 노래방' : '🔞 성인'}
          </button>
        ))}
      </div>

      {/* Level tabs */}
      <div className="flex gap-2">
        {(['level1', 'level2', 'level3'] as MissionLevel[]).map(lv => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`flex-1 py-2 rounded-xl font-noto font-bold text-xs border transition-all ${
              level === lv ? 'border-[#FF69B4] bg-[#FF69B4]/15 text-[#FF69B4]' : 'border-white/20 text-white/40'
            }`}
          >
            Lv.{lv.replace('level', '')}
          </button>
        ))}
      </div>

      {/* Mission list */}
      <div className="flex flex-col gap-2">
        {currentList.map(m => (
          <div key={m.id} className="p-3 rounded-xl border border-white/10 bg-white/5">
            {editingId === m.id ? (
              <div className="flex flex-col gap-2">
                <input value={editText.ko} onChange={e => setEditText(p => ({ ...p, ko: e.target.value }))}
                  placeholder="한국어" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
                <input value={editText.en} onChange={e => setEditText(p => ({ ...p, en: e.target.value }))}
                  placeholder="English" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
                <input value={editText.vi} onChange={e => setEditText(p => ({ ...p, vi: e.target.value }))}
                  placeholder="Tiếng Việt" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
                <div className="flex gap-2">
                  <button onClick={handleEditSave} className="flex-1 py-2 rounded-lg bg-[#FFD700] text-black font-bold font-noto text-sm">저장</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 font-noto text-sm">취소</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="font-noto text-white text-sm flex-1">{m.text_ko}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleEditStart(m)} className="p-1.5 rounded-lg bg-white/10">
                    <Edit3 size={13} className="text-white/50" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-red-900/30">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {currentList.length === 0 && (
          <p className="text-center text-white/30 font-noto text-sm py-6">
            {mode === 'adult' ? '관리자가 직접 미션을 추가해주세요' : '미션이 없습니다'}
          </p>
        )}
      </div>

      {/* Add mission */}
      {showAdd ? (
        <div className="p-4 rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/5 flex flex-col gap-2">
          <input value={newMission.ko} onChange={e => setNewMission(p => ({ ...p, ko: e.target.value }))}
            placeholder="한국어 미션 텍스트 *" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
          <input value={newMission.en} onChange={e => setNewMission(p => ({ ...p, en: e.target.value }))}
            placeholder="English (선택사항)" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
          <input value={newMission.vi} onChange={e => setNewMission(p => ({ ...p, vi: e.target.value }))}
            placeholder="Tiếng Việt (선택사항)" className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-noto outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newMission.ko || saving}
              className="flex-1 py-2 rounded-xl bg-[#FFD700] text-black font-bebas text-lg tracking-wide disabled:opacity-40">
              {saving ? '저장 중…' : '추가'}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/60 font-noto text-sm">
              취소
            </button>
          </div>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#FFD700]/30 text-[#FFD700]/60 font-noto font-bold text-sm"
        >
          <Plus size={16} /> 미션 추가
        </motion.button>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({
  config, setConfig,
}: {
  config: ClubConfig
  setConfig: React.Dispatch<React.SetStateAction<ClubConfig>>
}) {
  const [showPinChange,  setShowPinChange]  = useState(false)
  const [newPin,         setNewPin]         = useState('')

  // ── Password change section (local auth) ──
  const [showPwSection,  setShowPwSection]  = useState(false)
  const [currentPw,      setCurrentPw]      = useState('')
  const [newPw,          setNewPw]          = useState('')
  const [confirmPw,      setConfirmPw]      = useState('')
  const [pwError,        setPwError]        = useState('')
  const [pwSuccess,      setPwSuccess]      = useState(false)
  const [showCurrentPw,  setShowCurrentPw]  = useState(false)
  const [showNewPw,      setShowNewPw]      = useState(false)

  const toggles: { key: keyof ClubConfig; label: string; desc: string }[] = [
    { key: 'jackpotForcedShot', label: '잭팟 → 원샷 강제',      desc: '잭팟 결과 시 항상 100% 원샷으로 고정' },
    { key: 'reSpinEnabled',     label: '리스핀 활성화',          desc: '"한번더" 결과가 나올 수 있습니다'       },
    { key: 'curseTierEnabled',  label: '저주 티어 이펙트',       desc: '1K/2K/5K 저주 애니메이션 활성화'       },
    { key: 'escalationEnabled', label: '긴장 고조 효과',         desc: '연속 스핀 시 드럼롤 BPM/볼륨 상승'     },
    { key: 'nearMissEnabled',   label: '니어미스 효과',          desc: '최종 결과 직전 아슬아슬 흔들기'        },
    { key: 'autoBillboard',     label: '자동 빌보드 모드',       desc: '결과 표시 후 자동 전체화면 전환'        },
  ]

  const handleToggle = (key: keyof ClubConfig) => {
    setConfig(c => ({ ...c, [key]: !c[key] }))
  }

  const handlePinSave = () => {
    if (newPin.length !== 4 || isNaN(Number(newPin))) return
    setConfig(c => ({ ...c, adultPIN: newPin }))
    setNewPin('')
    setShowPinChange(false)
  }

  const handlePasswordChange = () => {
    setPwError('')
    setPwSuccess(false)
    if (newPw !== confirmPw) {
      setPwError('새 비밀번호가 일치하지 않습니다')
      return
    }
    const err = changeAdminPassword(currentPw, newPw)
    if (err) {
      setPwError(err)
    } else {
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => { setPwSuccess(false); setShowPwSection(false) }, 2000)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle switches */}
      {toggles.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
          <div>
            <p className="font-noto font-bold text-white text-sm">{label}</p>
            <p className="font-noto text-white/40 text-xs mt-0.5">{desc}</p>
          </div>
          <button
            onClick={() => handleToggle(key)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
              config[key] as boolean ? 'bg-[#FFD700]' : 'bg-white/20'
            }`}
          >
            <motion.div
              animate={{ x: (config[key] as boolean) ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-black rounded-full"
            />
          </button>
        </div>
      ))}

      {/* Adult PIN change */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-noto font-bold text-white text-sm">성인 모드 PIN 변경</p>
            <p className="font-noto text-white/40 text-xs">현재 PIN: {config.adultPIN}</p>
          </div>
          <button
            onClick={() => setShowPinChange(!showPinChange)}
            className="px-3 py-1.5 rounded-xl bg-white/10 font-noto text-xs text-white/60"
          >
            {showPinChange ? '취소' : '변경'}
          </button>
        </div>
        <AnimatePresence>
          {showPinChange && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.slice(0, 4))}
                  placeholder="새 PIN 4자리"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-noto text-sm outline-none"
                />
                <button
                  onClick={handlePinSave}
                  disabled={newPin.length !== 4}
                  className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold font-noto text-sm disabled:opacity-40"
                >
                  저장
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin password change */}
      <div className="p-4 rounded-2xl border border-[#FF69B4]/20 bg-[#FF69B4]/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#FF69B4]" />
            <div>
              <p className="font-noto font-bold text-white text-sm">관리자 비밀번호 변경</p>
              <p className="font-noto text-white/40 text-xs">로그인 비밀번호 변경</p>
            </div>
          </div>
          <button
            onClick={() => { setShowPwSection(!showPwSection); setPwError(''); setPwSuccess(false) }}
            className="px-3 py-1.5 rounded-xl bg-white/10 font-noto text-xs text-white/60"
          >
            {showPwSection ? '닫기' : '변경'}
          </button>
        </div>

        <AnimatePresence>
          {showPwSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 mt-3">
                {/* Current password */}
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="현재 비밀번호"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/20 text-white font-noto text-sm outline-none focus:border-[#FF69B4]"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* New password */}
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="새 비밀번호 (6자 이상)"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/20 text-white font-noto text-sm outline-none focus:border-[#FF69B4]"
                  />
                  <button type="button" onClick={() => setShowNewPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Confirm password */}
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  autoComplete="new-password"
                  className={`w-full px-3 py-2.5 rounded-xl bg-white/10 border text-white font-noto text-sm outline-none transition-colors ${
                    confirmPw && confirmPw !== newPw ? 'border-red-500' : 'border-white/20 focus:border-[#FF69B4]'
                  }`}
                />

                <AnimatePresence>
                  {pwError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs font-noto">{pwError}</motion.p>
                  )}
                  {pwSuccess && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-green-400 text-xs font-noto">✓ 비밀번호가 변경되었습니다</motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePasswordChange}
                  disabled={!currentPw || newPw.length < 6 || newPw !== confirmPw}
                  className="w-full py-2.5 rounded-xl bg-[#FF69B4] text-black font-bebas text-lg tracking-wide disabled:opacity-40"
                >
                  비밀번호 변경
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account info */}
      <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-center">
        <p className="font-noto text-white/30 text-xs">
          현재 관리자 계정: <span className="text-white/60">{getAdminEmail()}</span>
        </p>
      </div>
    </div>
  )
}
