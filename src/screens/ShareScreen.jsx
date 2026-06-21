import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { db } from '../firebase'
import { useChildren } from '../hooks/useChildren'
import { useTimetable } from '../hooks/useTimetable'
import AppShell from '../components/AppShell'

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function ShareScreen({ user }) {
  const { childId } = useParams()
  const children = useChildren(user.uid)
  const child = children.find(c => c.id === childId)
  const timetable = useTimetable(user.uid, childId)

  const [shareId, setShareId] = useState(null)
  const [shareUrl, setShareUrl] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (child?.shareId) {
      const url = `${window.location.origin}/share/${child.shareId}`
      setShareId(child.shareId)
      setShareUrl(url)
    }
  }, [child?.shareId])

  async function handleCreateShare() {
    setCreating(true)
    const id = nanoid(10)
    const activeDays = child?.hasSaturday ? ALL_DAYS : ALL_DAYS.slice(0, 5)
    const snapshot = {}
    activeDays.forEach(day => { snapshot[day] = timetable[day] || [] })

    await setDoc(doc(db, 'sharedTimetables', id), {
      ownerUid: user.uid,
      childName: child.name,
      childEmoji: child.emoji,
      childClass: child.className || '',
      hasSaturday: child?.hasSaturday || false,
      timetable: snapshot,
      createdAt: new Date().toISOString(),
    })
    await updateDoc(doc(db, 'users', user.uid, 'children', childId), { shareId: id })

    const url = `${window.location.origin}/share/${id}`
    setShareId(id)
    setShareUrl(url)
    setCreating(false)
  }

  async function handleRemoveShare() {
    if (!window.confirm('Remove this share link? Anyone with the link will no longer be able to access it.')) return
    await deleteDoc(doc(db, 'sharedTimetables', shareId))
    await updateDoc(doc(db, 'users', user.uid, 'children', childId), { shareId: null })
    setShareId(null)
    setShareUrl('')
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const message = `Check out ${child?.emoji} ${child?.name}'s school timetable! Download the Timetable app and import it:\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (!child) return null

  return (
    <AppShell title={`Share ${child.emoji} ${child.name}`} showBack>

      {!shareId ? (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px', lineHeight: 1 }}>🔗</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.3px', color: 'var(--text)' }}>
            Share with other parents
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6, fontSize: '15px' }}>
            Generate a link that other parents in {child.name}'s class can open to view and import the timetable.
          </p>
          <button
            onClick={handleCreateShare}
            disabled={creating}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-pill)',
              padding: '15px 36px',
              fontWeight: 700,
              fontSize: '16px',
              opacity: creating ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {creating ? 'Creating link…' : 'Create share link'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Share URL card */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Share link
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              wordBreak: 'break-all',
              marginBottom: '14px',
              lineHeight: 1.6,
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
            }}>
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                background: copied ? 'var(--secondary)' : 'var(--primary)',
                color: '#fff',
                borderRadius: 'var(--radius-pill)',
                padding: '13px',
                fontWeight: 700,
                fontSize: '15px',
                transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy link'}
            </button>
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            style={{
              background: '#25D366',
              color: '#fff',
              borderRadius: 'var(--radius)',
              padding: '15px 16px',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            Share on WhatsApp
          </button>

          {/* Remove share */}
          <button
            onClick={handleRemoveShare}
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '14px',
              padding: '12px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)',
              marginTop: '4px',
            }}
          >
            Remove share link
          </button>

        </div>
      )}
    </AppShell>
  )
}
