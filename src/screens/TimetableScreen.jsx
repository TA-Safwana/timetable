import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useTimetable } from '../hooks/useTimetable'
import { useChildren } from '../hooks/useChildren'
import AppShell from '../components/AppShell'
import { DAY_LABELS, DAY_COLORS } from '../components/DayNav'

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']
const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function TimetableScreen({ user, childId }) {
  const navigate = useNavigate()
  const timetable = useTimetable(user.uid, childId)
  const children = useChildren(user.uid)
  const child = children.find(c => c.id === childId)

  const [hasSaturday, setHasSaturday] = useState(child?.hasSaturday || false)
  const [drafts, setDrafts] = useState(null)
  const [activeDay, setActiveDay] = useState('mon')
  const [input, setInput] = useState('')
  const [dupWarning, setDupWarning] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (child && child.hasSaturday !== undefined) setHasSaturday(child.hasSaturday)
  }, [child?.hasSaturday])

  useEffect(() => {
    if (!drafts && Object.keys(timetable).length > 0) setDrafts({ ...timetable })
  }, [timetable, drafts])

  useEffect(() => { setDupWarning(false) }, [input])

  const activeDays = hasSaturday ? ALL_DAYS : WEEKDAYS
  const dayIdx = activeDays.indexOf(activeDay)
  const isLastDay = dayIdx === activeDays.length - 1
  const current = drafts?.[activeDay] || []
  const { bg, text, border } = DAY_COLORS[activeDay]

  function addSubject() {
    const val = input.trim()
    if (!val) return
    if (current.some(s => s.toLowerCase() === val.toLowerCase())) {
      setDupWarning(true)
      inputRef.current?.select()
      return
    }
    setDrafts(d => ({ ...d, [activeDay]: [...(d[activeDay] || []), val] }))
    setInput('')
    inputRef.current?.focus()
  }

  function removeSubject(s) {
    setDrafts(d => ({ ...d, [activeDay]: d[activeDay].filter(x => x !== s) }))
  }

  function goToNextDay() {
    setInput('')
    setDupWarning(false)
    setActiveDay(activeDays[dayIdx + 1])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function switchDay(d) {
    setInput('')
    setDupWarning(false)
    setActiveDay(d)
  }

  function toggleSaturday(val) {
    setHasSaturday(val)
    if (!val && activeDay === 'sat') setActiveDay('fri')
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all([
      ...ALL_DAYS.map(day =>
        setDoc(
          doc(db, 'users', user.uid, 'children', childId, 'timetable', day),
          { subjects: (drafts?.[day] || []).map(s => s.trim()).filter(Boolean) }
        )
      ),
      updateDoc(doc(db, 'users', user.uid, 'children', childId), { hasSaturday })
    ])
    setSaving(false)
    navigate(-1)
  }

  return (
    <AppShell title="Set Timetable" showBack>

      {/* Progress bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {activeDays.map((d, i) => (
            <div
              key={d}
              onClick={() => switchDay(d)}
              style={{
                flex: 1,
                height: '5px',
                borderRadius: '3px',
                background: i < dayIdx ? '#ccc' : i === dayIdx ? DAY_COLORS[d].border : 'var(--border)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          {activeDays.map(d => (
            <span
              key={d}
              onClick={() => switchDay(d)}
              style={{
                flex: 1,
                fontSize: '11px',
                color: activeDay === d ? DAY_COLORS[d].text : 'var(--text-muted)',
                fontWeight: activeDay === d ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {DAY_LABELS[d].slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* Day heading */}
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', color: text, letterSpacing: '-0.3px' }}>
        {DAY_LABELS[activeDay]}
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Add all subjects for this day
      </p>

      {/* Subject chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
        minHeight: '44px',
        padding: current.length ? '12px' : '0',
        background: current.length ? bg : 'transparent',
        borderRadius: 'var(--radius)',
        border: current.length ? `1.5px solid ${border}30` : 'none',
        transition: 'all 0.2s',
      }}>
        {current.map(s => (
          <span
            key={s}
            style={{
              background: 'var(--surface)',
              color: text,
              border: `1.5px solid ${border}`,
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {s}
            <button
              onClick={() => removeSubject(s)}
              style={{ color: text, fontSize: '16px', lineHeight: 1, opacity: 0.6 }}
            >
              ×
            </button>
          </span>
        ))}
        {current.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '4px 0' }}>
            No subjects yet — add below
          </span>
        )}
      </div>

      {/* Add input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSubject()}
          placeholder="Type a subject, press Enter or +"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            border: `1.5px solid ${dupWarning ? 'var(--primary)' : border + '80'}`,
            fontSize: '16px',
            background: dupWarning ? '#fde8ed' : 'var(--surface)',
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={addSubject}
          style={{
            background: border,
            color: '#fff',
            borderRadius: 'var(--radius)',
            padding: '12px 18px',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      {/* Duplicate warning */}
      {dupWarning && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          background: '#fde8ed',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#b01c39',
          fontWeight: 500,
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
          <span><strong>{input.trim()}</strong> is already in the list — it'll only appear once when packing.</span>
        </div>
      )}

      {/* Saturday toggle — only on Friday */}
      {activeDay === 'fri' && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginTop: '12px',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>School on Saturday?</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {hasSaturday ? 'Tap Next to add Saturday subjects' : 'Toggle on to add Saturday'}
            </div>
          </div>
          <button
            onClick={() => toggleSaturday(!hasSaturday)}
            style={{
              width: '48px',
              height: '26px',
              borderRadius: '13px',
              background: hasSaturday ? 'var(--secondary)' : '#ddd',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: hasSaturday ? '25px' : '3px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      )}

      {/* Next / Save */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!isLastDay ? (
          <button
            onClick={goToNextDay}
            style={{
              width: '100%',
              background: DAY_COLORS[activeDays[dayIdx + 1]]?.border || 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-pill)',
              padding: '15px',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            Next: {DAY_LABELS[activeDays[dayIdx + 1]]} →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              background: 'var(--secondary)',
              color: '#fff',
              borderRadius: 'var(--radius-pill)',
              padding: '15px',
              fontWeight: 700,
              fontSize: '16px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Timetable'}
          </button>
        )}

        {dayIdx > 0 && !isLastDay && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              background: 'transparent',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-pill)',
              padding: '12px',
              fontWeight: 600,
              fontSize: '14px',
              border: '1.5px solid var(--border)',
            }}
          >
            {saving ? 'Saving…' : 'Save & finish early'}
          </button>
        )}
      </div>

    </AppShell>
  )
}
