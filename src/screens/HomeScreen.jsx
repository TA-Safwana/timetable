import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useChildren } from '../hooks/useChildren'
import { useTimetable } from '../hooks/useTimetable'
import AppShell from '../components/AppShell'
import ChildSwitcher from '../components/ChildSwitcher'
import DayNav, { DAY_LABELS, DAY_COLORS } from '../components/DayNav'
import BookList from '../components/BookList'

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri']
const NAV_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const SUNDAY_TIPS = [
  { emoji: '🌳', tip: 'Go for a walk in the park.' },
  { emoji: '📖', tip: 'Pick up a book you\'ve been meaning to read.' },
  { emoji: '🎲', tip: 'Play a board game with the family.' },
  { emoji: '🍳', tip: 'Try cooking something new together.' },
  { emoji: '🎨', tip: 'Break out the art supplies and get creative.' },
  { emoji: '🎬', tip: 'Movie marathon — popcorn is mandatory.' },
  { emoji: '🧘', tip: 'Take a slow morning. No rush today.' },
  { emoji: '🚴', tip: 'Go for a bike ride as a family.' },
]

function todayKey() {
  const d = new Date().getDay()
  if (d === 0) return 'sun'
  if (d === 6) return 'sat'
  return WEEKDAYS[d - 1]
}

function RestCard({ day }) {
  const isSunday = day === 'sun'

  const config = isSunday ? {
    bg: 'linear-gradient(135deg, #E8F8F0 0%, #EDF8E4 100%)',
    border: '#2FBF7130',
    accent: '#2FBF71',
    titleColor: '#1a6b3a',
    bodyColor: '#3d6e1a',
    emoji: '☀️',
    title: 'Happy Sunday!',
    body: 'No bags to pack today. Rest up and enjoy the day with your family.',
    reminderText: 'Tap Monday above to check tomorrow\'s books before bedtime.',
    reminderColor: '#1a6b3a',
    reminderBg: '#E8F8F0',
    reminderBorder: '#2FBF7130',
  } : {
    bg: 'linear-gradient(135deg, #EAE8FD 0%, #f0effe 100%)',
    border: '#6c5ce730',
    accent: '#6c5ce7',
    titleColor: '#4a3aa8',
    bodyColor: '#4a3aa8',
    emoji: '🎉',
    title: 'Weekend!',
    body: 'No school today. Enjoy your Saturday — you\'ve earned it!',
    reminderText: 'Tap Monday above to get a head start on next week.',
    reminderColor: '#4a3aa8',
    reminderBg: '#EAE8FD',
    reminderBorder: '#6c5ce730',
  }

  const seed = new Date().getDate()
  const tips = isSunday
    ? [0, 1, 2].map(i => SUNDAY_TIPS[(seed + i) % SUNDAY_TIPS.length])
    : []

  return (
    <div>
      <div style={{
        background: config.bg,
        borderRadius: 'var(--radius)',
        padding: '28px 20px',
        textAlign: 'center',
        marginBottom: '12px',
        border: `1.5px solid ${config.border}`,
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px', lineHeight: 1 }}>{config.emoji}</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: config.titleColor, marginBottom: '6px', letterSpacing: '-0.3px' }}>
          {config.title}
        </h2>
        <p style={{ fontSize: '14px', color: config.bodyColor, lineHeight: 1.6, opacity: 0.85 }}>
          {config.body}
        </p>
      </div>

      {isSunday && (
        <>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase', paddingLeft: '2px' }}>
            Ideas for today
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {tips.map(({ emoji, tip }) => (
              <div key={tip} style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                borderLeft: '4px solid #8CD867',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{emoji}</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.4 }}>{tip}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{
        background: config.reminderBg,
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: `1.5px solid ${config.reminderBorder}`,
      }}>
        <span style={{ fontSize: '18px' }}>💡</span>
        <p style={{ fontSize: '13px', color: config.reminderColor, fontWeight: 500, lineHeight: 1.4 }}>
          {config.reminderText}
        </p>
      </div>
    </div>
  )
}

export default function HomeScreen({ user }) {
  const navigate = useNavigate()
  const children = useChildren(user.uid)
  const [activeChildId, setActiveChildId] = useState(null)

  const childId = activeChildId || children[0]?.id || null
  const activeChild = children.find(c => c.id === childId)
  const hasSaturday = activeChild?.hasSaturday || false

  const [day, setDay] = useState(() => todayKey())
  const idx = NAV_DAYS.indexOf(day)

  const timetable = useTimetable(user.uid, childId)
  const isRestDay = day === 'sun' || (day === 'sat' && !hasSaturday)
  const subjects = isRestDay ? [] : (timetable[day] || [])

  const rightAction = (
    <button
      onClick={() => signOut(auth)}
      style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500 }}
    >
      Sign out
    </button>
  )

  if (children.length === 0) {
    return (
      <AppShell title="School Bag 🎒" rightAction={rightAction}>
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', lineHeight: 1 }}>👨‍👧‍👦</div>
          <p style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Welcome!
          </p>
          <p style={{ marginBottom: '28px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.5 }}>
            Add your first child to get started
          </p>
          <button
            onClick={() => navigate('/children/new')}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-pill)',
              padding: '14px 32px',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            Add a child
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="School Bag 🎒" rightAction={rightAction}>
      <ChildSwitcher
        children={children}
        activeId={childId}
        onSelect={id => {
          setActiveChildId(id)
          setDay(todayKey())
        }}
      />
      <DayNav
        day={day}
        activeDays={NAV_DAYS}
        onPrev={() => setDay(NAV_DAYS[idx - 1])}
        onNext={() => setDay(NAV_DAYS[idx + 1])}
      />
      {isRestDay ? (
        <RestCard day={day} />
      ) : (
        <BookList subjects={subjects} childId={childId} day={day} />
      )}
    </AppShell>
  )
}
