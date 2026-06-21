import { useState, useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = signed out
  const [redirectChecked, setRedirectChecked] = useState(false)

  useEffect(() => {
    // Process any pending redirect result before resolving auth state
    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => setRedirectChecked(true))

    return onAuthStateChanged(auth, setUser)
  }, [])

  // Stay in loading state until redirect result is processed
  if (!redirectChecked) return undefined
  return user
}
