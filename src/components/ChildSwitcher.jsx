import { useNavigate } from 'react-router-dom'

const CHILD_COLORS = [
  { bg: '#EF2D56', light: '#FDE8ED', text: '#b01c39' },
  { bg: '#2FBF71', light: '#E8F8F0', text: '#1a6b3a' },
  { bg: '#ED7D3A', light: '#FDF0E8', text: '#b05a1a' },
  { bg: '#6c5ce7', light: '#EAE8FD', text: '#4a3aa8' },
  { bg: '#8CD867', light: '#EDF8E4', text: '#3d6e1a' },
]

function colorForIndex(idx) {
  return CHILD_COLORS[idx % CHILD_COLORS.length]
}

export default function ChildSwitcher({ children, activeId, onSelect }) {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
      marginBottom: '16px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {children.map((child, idx) => {
        const { bg, light, text } = colorForIndex(idx)
        const isActive = activeId === child.id
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: isActive ? bg : 'var(--surface)',
              color: isActive ? '#fff' : 'var(--text)',
              fontWeight: 600,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              border: isActive ? 'none' : '1.5px solid var(--border)',
              boxShadow: isActive ? `0 3px 10px ${bg}50` : 'var(--shadow-sm)',
              transition: 'all 0.15s',
            }}
          >
            {child.emoji} {child.name}
          </button>
        )
      })}
      <button
        onClick={() => navigate('/children/new')}
        style={{
          flexShrink: 0,
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--surface)',
          border: '1.5px dashed var(--border)',
          color: 'var(--text-muted)',
          fontWeight: 500,
          fontSize: '14px',
          whiteSpace: 'nowrap',
        }}
      >
        + Add
      </button>
    </div>
  )
}
