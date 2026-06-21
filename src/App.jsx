import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { getRedirectResult } from 'firebase/auth'
import { auth } from './firebase'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import ChildrenScreen, { ChildFormScreen } from './screens/ChildrenScreen'
import TimetableScreen from './screens/TimetableScreen'
import ShareScreen from './screens/ShareScreen'
import SharedTimetableScreen from './screens/SharedTimetableScreen'

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '48px' }}>
      🎒
    </div>
  )
}

function RequireAuth({ children, user }) {
  if (user === undefined) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function TimetableRoute({ user }) {
  const { childId } = useParams()
  return <TimetableScreen user={user} childId={childId} />
}

function ChildEditRoute({ user }) {
  const { childId } = useParams()
  return <ChildFormScreen user={user} childId={childId} />
}

function ShareRoute({ user }) {
  const { childId } = useParams()
  return <ShareScreen user={user} childId={childId} />
}

export default function App() {
  const user = useAuth()

  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
  }, [])

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginScreen />} />

      <Route path="/" element={
        <RequireAuth user={user}>
          <HomeScreen user={user} />
        </RequireAuth>
      } />

      <Route path="/children" element={
        <RequireAuth user={user}>
          <ChildrenScreen user={user} />
        </RequireAuth>
      } />

      <Route path="/children/new" element={
        <RequireAuth user={user}>
          <ChildFormScreen user={user} childId={null} />
        </RequireAuth>
      } />

      <Route path="/children/:childId/edit" element={
        <RequireAuth user={user}>
          <ChildEditRoute user={user} />
        </RequireAuth>
      } />

      <Route path="/children/:childId/timetable" element={
        <RequireAuth user={user}>
          <TimetableRoute user={user} />
        </RequireAuth>
      } />

      <Route path="/children/:childId/share" element={
        <RequireAuth user={user}>
          <ShareRoute user={user} />
        </RequireAuth>
      } />

      {/* Public — no auth required */}
      <Route path="/share/:shareId" element={<SharedTimetableScreen user={user} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
