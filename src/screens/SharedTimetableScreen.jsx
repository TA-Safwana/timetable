import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import { useSharedTimetable } from '../hooks/useSharedTimetable'
import { useChildren } from '../hooks/useChildren'
import SubjectTag from '../components/SubjectTag'
import { DAY_LABELS, DAY_COLORS } from '../components/DayNav'

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']
const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const EMOJIS = ['🐬', '🦁', '🐼', '🦊', '🐸', '🦄', '🐧', '🦋', '🐙', '🌟']

export default function SharedTimetableScreen({ user }) {
  const { shareId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useSharedTimetable(shareId)
  const [showImportModal, setShowImportModal] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (user && sessionStorage.getItem('postShareImport') === shareId) {
      sessionStorage.removeItem('postShareImport')
      setShowImportModal(true)
    }
  }, [user, shareId])

  async function handleImportCTA() {
    if (!user) {
      setSigningIn(true)
      sessionStorage.setItem('postShareImport', shareId)
      try {
        await signInWithPopup(auth, googleProvider)
        setShowImportModal(true)
      } catch {
        sessionStorage.removeItem('postShareImport')
      }
      setSigningIn(false)
    } else {
      setShowImportModal(true)
    }
  }

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: '16px',
    }}>
      <div style={{ fontSize: '56px', lineHeight: 1 }}>🎒</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading timetable…</p>
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>😕</div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.3px' }}>Link not found</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
        This share link may have been removed or expired.
      </p>
    </div>
  )

  const activeDays = data.hasSaturday ? ALL_DAYS : WEEKDAYS

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #EF2D56 0%, #ED7D3A 100%)',
        padding: '20px 16px 28px',
        color: '#fff',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', opacity: 0.85, letterSpacing: '0.3px' }}>
          🎒 Timetable
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '44px', lineHeight: 1 }}>{data.childEmoji}</span>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {data.childName}'s Timetable
            </h1>
            {data.childClass && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-pill)',
                padding: '3px 12px',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: '6px',
              }}>
                {data.childClass}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App intro — only for non-signed-in visitors */}
      {!user && (
        <div style={{
          margin: '16px 16px 0',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '18px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '19px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.2px', color: 'var(--text)' }}>
            Never forget a book again 🎒
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
            Timetable helps parents know exactly which books to pack each day.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['📅', 'View any day\'s book list in seconds'],
              ['📥', 'Import timetables shared by other parents'],
              ['👨‍👧‍👦', 'Manage multiple children in one app'],
              ['📴', 'Works offline after first load'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable by day */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeDays.map(day => {
          const subjects = data.timetable[day] || []
          const { bg, text, border } = DAY_COLORS[day]
          return (
            <div key={day} style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                background: bg,
                padding: '10px 16px',
                fontWeight: 700,
                fontSize: '15px',
                color: text,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1.5px solid ${border}33`,
              }}>
                <span>{DAY_LABELS[day]}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8 }}>
                  {subjects.length} book{subjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subjects.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '2px 0' }}>No subjects</span>
                ) : (
                  subjects.map((s, i) => <SubjectTag key={s} name={s} index={i} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Import CTA — sticky bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '12px 16px env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={handleImportCTA}
          disabled={signingIn}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
            color: '#fff',
            borderRadius: 'var(--radius-pill)',
            padding: '15px',
            fontWeight: 700,
            fontSize: '16px',
            opacity: signingIn ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {signingIn ? 'Signing in…' : user ? '📥 Import to my child' : '🎒 Sign in & Import'}
        </button>
      </div>

      {/* Import modal */}
      {showImportModal && user && (
        <ImportModal
          user={user}
          shareData={data}
          onClose={() => setShowImportModal(false)}
          onDone={() => navigate('/')}
        />
      )}
    </div>
  )
}

function ImportModal({ user, shareData, onClose, onDone }) {
  const children = useChildren(user.uid)
  const [mode, setMode] = useState('pick')
  const [selectedId, setSelectedId] = useState(null)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState(EMOJIS[0])
  const [importing, setImporting] = useState(false)

  // Auto-select if only one child
  useEffect(() => {
    if (children.length === 1 && !selectedId) setSelectedId(children[0].id)
  }, [children])

  async function handleImport() {
    let childId = selectedId
    if (mode === 'pick' && !childId) return // hard guard
    setImporting(true)

    if (mode === 'new') {
      const ref = await addDoc(collection(db, 'users', user.uid, 'children'), {
        name: newName.trim(),
        emoji: newEmoji,
        order: children.length,
        hasSaturday: shareData.hasSaturday,
      })
      childId = ref.id
    } else {
      await updateDoc(doc(db, 'users', user.uid, 'children', childId), {
        hasSaturday: shareData.hasSaturday,
      })
    }

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    await Promise.all(
      days.map(day =>
        setDoc(
          doc(db, 'users', user.uid, 'children', childId, 'timetable', day),
          { subjects: shareData.timetable[day] || [] }
        )
      )
    )
    setImporting(false)
    onDone()
  }

  const canImport = mode === 'new' ? newName.trim().length > 0 : selectedId !== null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
        zIndex: 100,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px 16px 0 0',
        padding: '24px 16px',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* Handle bar */}
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          background: 'var(--border)', margin: '0 auto 20px',
        }} />

        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.2px' }}>
          Import timetable
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Which child should get {shareData.childEmoji} {shareData.childName}'s timetable?
        </p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['pick', 'Existing child'], ['new', 'New child']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-pill)',
                background: mode === m ? 'var(--primary)' : 'var(--surface)',
                color: mode === m ? '#fff' : 'var(--text)',
                fontWeight: 600,
                border: mode === m ? 'none' : '1.5px solid var(--border)',
                fontSize: '14px',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {children.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
                No children yet — create a new one
              </p>
            ) : children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  border: selectedId === c.id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  background: selectedId === c.id ? 'var(--primary-light)' : 'var(--surface)',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{ fontSize: '28px' }}>{c.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {mode === 'new' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Child's name"
              autoFocus
              style={{
                padding: '13px 16px',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)',
                fontSize: '16px',
                background: 'var(--surface)',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  style={{
                    fontSize: '24px',
                    width: '48px', height: '48px',
                    borderRadius: 'var(--radius)',
                    background: newEmoji === e ? 'var(--primary-light)' : 'var(--surface)',
                    border: newEmoji === e ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    transition: 'all 0.15s',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!canImport || importing}
          style={{
            width: '100%',
            background: 'var(--secondary)',
            color: '#fff',
            borderRadius: 'var(--radius-pill)',
            padding: '15px',
            fontWeight: 700,
            fontSize: '16px',
            opacity: !canImport || importing ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {importing ? 'Importing…' : '✓ Import timetable'}
        </button>
      </div>
    </div>
  )
}
