export const SUBJECT_PALETTE = [
  { accent: '#EF2D56', icon: '📕' },
  { accent: '#2FBF71', icon: '📗' },
  { accent: '#ED7D3A', icon: '📙' },
  { accent: '#6c5ce7', icon: '📘' },
  { accent: '#8CD867', icon: '📔' },
  { accent: '#ED7D3A', icon: '📒' },
]

function paletteForSubject(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length]
}

export default function SubjectTag({ name, index }) {
  const { accent, icon } = index !== undefined
    ? SUBJECT_PALETTE[index % SUBJECT_PALETTE.length]
    : paletteForSubject(name)

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      borderLeft: `4px solid ${accent}`,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{name}</span>
    </div>
  )
}
