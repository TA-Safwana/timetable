import { useState, useEffect } from 'react'
import SubjectTag, { SUBJECT_PALETTE } from './SubjectTag'
import { useNavigate } from 'react-router-dom'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function storageKey(childId, day) {
  return `packed:${childId}:${day}:${todayStr()}`
}

function loadPacked(childId, day) {
  try {
    const raw = sessionStorage.getItem(storageKey(childId, day))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function savePacked(childId, day, packed) {
  try {
    sessionStorage.setItem(storageKey(childId, day), JSON.stringify(packed))
  } catch {}
}

export default function BookList({ subjects, childId, day }) {
  const navigate = useNavigate()
  const [packed, setPacked] = useState(() => loadPacked(childId, day))

  useEffect(() => {
    setPacked(loadPacked(childId, day))
  }, [childId, day])

  function toggle(subject) {
    const next = packed.includes(subject)
      ? packed.filter(s => s !== subject)
      : [...packed, subject]
    setPacked(next)
    savePacked(childId, day, next)
  }

  if (subjects.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 24px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎒</div>
        <p style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>
          No subjects yet
        </p>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Set up the timetable for this child
        </p>
        {childId && (
          <button
            onClick={() => navigate(`/children/${childId}/timetable`)}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-pill)',
              padding: '12px 28px',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            Set up timetable
          </button>
        )}
      </div>
    )
  }

  const packedCount = packed.length
  const allPacked = packedCount === subjects.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2px',
        paddingLeft: '2px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {subjects.length} book{subjects.length !== 1 ? 's' : ''} to pack
        </span>
        {packedCount > 0 && !allPacked && (
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--secondary)',
            background: 'var(--secondary-light)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px 10px',
          }}>
            {packedCount} of {subjects.length} packed
          </span>
        )}
      </div>

      {allPacked && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'var(--secondary-light)',
          borderRadius: 'var(--radius)',
          border: '1.5px solid #2FBF7130',
        }}>
          <span style={{ fontSize: '24px' }}>🎉</span>
          <p style={{ fontWeight: 700, color: '#1a6b3a', fontSize: '14px', marginTop: '4px' }}>
            All packed! Have a great day!
          </p>
        </div>
      )}

      {subjects.map((s, i) => (
        <PackRow
          key={s}
          name={s}
          index={i}
          isPacked={packed.includes(s)}
          onToggle={() => toggle(s)}
        />
      ))}
    </div>
  )
}

function PackRow({ name, index, isPacked, onToggle }) {
  const { accent, icon } = SUBJECT_PALETTE[index % SUBJECT_PALETTE.length]

  return (
    <div style={{
      background: isPacked ? '#fafafa' : 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '13px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderLeft: `4px solid ${isPacked ? '#ddd' : accent}`,
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s',
    }}>
      <span style={{ fontSize: '20px', lineHeight: 1, opacity: isPacked ? 0.3 : 1, transition: 'opacity 0.2s' }}>
        {icon}
      </span>
      <span style={{
        flex: 1,
        fontSize: '16px',
        fontWeight: 600,
        color: isPacked ? '#ccc' : 'var(--text)',
        textDecoration: isPacked ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {name}
      </span>
      <button
        onClick={onToggle}
        style={{
          flexShrink: 0,
          padding: '7px 14px',
          borderRadius: 'var(--radius-pill)',
          background: isPacked ? 'var(--secondary)' : 'transparent',
          border: `1.5px solid ${isPacked ? 'var(--secondary)' : accent}`,
          color: isPacked ? '#fff' : accent,
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s',
          minWidth: '70px',
        }}
      >
        {isPacked ? '✓ Packed' : 'Pack'}
      </button>
    </div>
  )
}
