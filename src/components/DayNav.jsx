const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAY_LABELS = {
  sun: 'Sunday',
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday'
}

const DAY_COLORS = {
  sun: { bg: '#E8F8F0', text: '#1a6b3a', border: '#2FBF71' },
  mon: { bg: '#FDE8ED', text: '#b01c39', border: '#EF2D56' },
  tue: { bg: '#FDF0E8', text: '#b05a1a', border: '#ED7D3A' },
  wed: { bg: '#FDE8ED', text: '#b01c39', border: '#EF2D56' },
  thu: { bg: '#E8F8F0', text: '#1a6b3a', border: '#2FBF71' },
  fri: { bg: '#EDF8E4', text: '#3d6e1a', border: '#8CD867' },
  sat: { bg: '#EAE8FD', text: '#4a3aa8', border: '#6c5ce7' },
}

const DAYS = ALL_DAYS

export { DAYS, ALL_DAYS, DAY_LABELS, DAY_COLORS }

export default function DayNav({ day, activeDays, onPrev, onNext }) {
  const idx = activeDays.indexOf(day)
  const { bg, text, border } = DAY_COLORS[day]

  const subtitles = {
    sun: 'Rest day 🌟',
    mon: 'Start of the week',
    fri: 'End of the week',
    sat: activeDays.includes('sat') ? 'End of the week' : 'Weekend',
  }
  const subtitle = subtitles[day] || `Day ${idx + 1} of ${activeDays.filter(d => d !== 'sun').length}`

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: bg,
      borderRadius: 'var(--radius)',
      marginBottom: '16px',
      border: `1.5px solid ${border}33`,
      overflow: 'hidden',
    }}>
      <button
        onClick={onPrev}
        disabled={idx === 0}
        style={{
          padding: '16px 14px',
          color: idx === 0 ? 'transparent' : text,
          fontSize: '20px',
          fontWeight: 700,
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
      >
        ‹
      </button>

      <div style={{ flex: 1, textAlign: 'center', padding: '14px 0' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: text, letterSpacing: '-0.3px' }}>
          {DAY_LABELS[day]}
        </div>
        <div style={{ fontSize: '12px', color: text, opacity: 0.65, marginTop: '2px', fontWeight: 500 }}>
          {subtitle}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={idx === activeDays.length - 1}
        style={{
          padding: '16px 14px',
          color: idx === activeDays.length - 1 ? 'transparent' : text,
          fontSize: '20px',
          fontWeight: 700,
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
      >
        ›
      </button>
    </div>
  )
}
