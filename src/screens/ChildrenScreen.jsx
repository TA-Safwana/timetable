import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPencil, FaShareNodes } from 'react-icons/fa6'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { useChildren } from '../hooks/useChildren'
import { useTimetable } from '../hooks/useTimetable'
import AppShell from '../components/AppShell'

const EMOJIS = ['🐬', '🦁', '🐼', '🦊', '🐸', '🦄', '🐧', '🦋', '🐙', '🌟']

export default function ChildrenScreen({ user }) {
  const navigate = useNavigate()
  const children = useChildren(user.uid)

  return (
    <AppShell title="Children">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children.map(child => (
          <ChildCard key={child.id} child={child} uid={user.uid} />
        ))}
        <button
          onClick={() => navigate('/children/new')}
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '15px',
            textAlign: 'center',
            background: 'transparent',
          }}
        >
          + Add child
        </button>
      </div>
    </AppShell>
  )
}

function ChildCard({ child, uid }) {
  const navigate = useNavigate()
  const timetable = useTimetable(uid, child.id)
  const hasTimetable = Object.values(timetable).some(subjects => subjects.length > 0)

  async function handleDelete() {
    if (!window.confirm(`Remove ${child.name}? This will also delete their timetable.`)) return
    const ttRef = collection(db, 'users', uid, 'children', child.id, 'timetable')
    const snap = await getDocs(ttRef)
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
    await deleteDoc(doc(db, 'users', uid, 'children', child.id))
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px', lineHeight: 1 }}>{child.emoji}</span>

        {/* Name + actions */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{child.name}</span>
            <button
              onClick={() => navigate(`/children/${child.id}/edit`)}
              title="Edit"
              style={{ lineHeight: 1, padding: '3px', color: 'var(--text-muted)', display: 'flex' }}
            >
              <FaPencil size={13} />
            </button>
            <button
              onClick={() => navigate(`/children/${child.id}/share`)}
              title="Share"
              style={{ lineHeight: 1, padding: '3px', color: 'var(--text-muted)', display: 'flex' }}
            >
              <FaShareNodes size={13} />
            </button>
          </div>
          {child.className && (
            <div style={{ fontSize: '13px', marginTop: '2px', color: 'var(--text-muted)' }}>{child.className}</div>
          )}
        </div>

        {/* Timetable */}
        <button
          onClick={() => navigate(`/children/${child.id}/timetable`)}
          style={{
            background: hasTimetable ? 'var(--secondary)' : 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '13px',
            flexShrink: 0,
          }}
        >
          {hasTimetable ? 'Timetable' : 'Add Timetable'}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          title="Remove"
          style={{ color: '#ccc', fontSize: '20px', lineHeight: 1, padding: '4px', flexShrink: 0 }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ChildFormScreen({ user, childId }) {
  const navigate = useNavigate()
  const children = useChildren(user.uid)
  const existing = children.find(c => c.id === childId)

  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loaded && existing) {
      setName(existing.name || '')
      setClassName(existing.className || '')
      setEmoji(existing.emoji || EMOJIS[0])
      setLoaded(true)
    }
  }, [existing, loaded])

  const title = childId
    ? (existing ? `Edit ${existing.emoji} ${existing.name}` : 'Edit Child')
    : 'Add Child'

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    if (childId) {
      await updateDoc(doc(db, 'users', user.uid, 'children', childId), {
        name: name.trim(), className: className.trim(), emoji,
      })
    } else {
      await addDoc(collection(db, 'users', user.uid, 'children'), {
        name: name.trim(), className: className.trim(), emoji, order: children.length,
      })
    }
    navigate('/children')
  }

  return (
    <AppShell title={title} showBack>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Child's name"
            autoFocus
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--border)',
              fontSize: '16px',
              background: 'var(--surface)',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Class / Grade{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '13px' }}>optional</span>
          </label>
          <input
            value={className}
            onChange={e => setClassName(e.target.value)}
            placeholder="e.g. Grade 3, Class 4B"
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--border)',
              fontSize: '16px',
              background: 'var(--surface)',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>
            Pick an emoji
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: '26px',
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius)',
                  background: emoji === e ? 'var(--primary-light)' : 'var(--surface)',
                  border: emoji === e ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  transition: 'all 0.15s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--radius-pill)',
            padding: '15px',
            fontWeight: 700,
            fontSize: '16px',
            opacity: !name.trim() || saving ? 0.5 : 1,
            marginTop: '4px',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </AppShell>
  )
}
