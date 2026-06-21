import { useState, useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    // Wait for redirect result first, then start listening to auth state.
    // This prevents onAuthStateChanged from firing null before the redirect
    // result is processed and causing a redirect loop.
    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => {
        const unsub = onAuthStateChanged(auth, setUser)
        // Store unsub so we can clean up
        cleanup = unsub
      })

    let cleanup = () => {}
    return () => cleanup()
  }, [])

  return user
}
