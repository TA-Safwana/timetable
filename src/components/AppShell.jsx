import { useNavigate, useLocation } from 'react-router-dom'

const ROUTE_COLORS = {
  '/': { bg: 'linear-gradient(135deg, #EF2D56 0%, #ED7D3A 100%)' },
  '/children': { bg: 'linear-gradient(135deg, #2FBF71 0%, #8CD867 100%)' },
}

function headerBg(pathname, showBack) {
  const match = Object.entries(ROUTE_COLORS).find(([p]) => pathname === p)
  if (match) return match[1].bg
  if (showBack) return 'linear-gradient(135deg, #ED7D3A 0%, #EF2D56 100%)'
  return 'var(--primary)'
}

export default function AppShell({ children, title, showBack, rightAction }) {
  const navigate = useNavigate()
  const location = useLocation()
  const bg = headerBg(location.pathname, showBack)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: bg,
        color: '#fff',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              color: '#fff',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            ‹
          </button>
        )}
        <h1 style={{ flex: 1, fontSize: '17px', fontWeight: 700, letterSpacing: '-0.2px' }}>{title}</h1>
        {rightAction}
      </header>

      <main style={{ flex: 1, padding: '16px', paddingBottom: '80px' }}>
        {children}
      </main>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <NavItem icon="🏠" label="Home" path="/" active={location.pathname === '/'} activeColor="var(--primary)" />
        <NavItem icon="👨‍👧‍👦" label="Children" path="/children" active={location.pathname.startsWith('/children')} activeColor="var(--secondary)" />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, path, active, activeColor }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '10px 0 12px',
        color: active ? activeColor : '#999',
        fontWeight: active ? 700 : 500,
        fontSize: '11px',
        letterSpacing: '0.2px',
        transition: 'color 0.15s',
      }}
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  )
}
