import { useState, useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'

const REDIRECT_KEY = 'auth_redirect_pending'

export function markRedirectPending() {
  localStorage.setItem(REDIRECT_KEY, '1')
}

export function useAuth() {
  const isReturningFromRedirect = localStorage.getItem(REDIRECT_KEY) === '1'
  const [user, setUser] = useState(isReturningFromRedirect ? undefined : undefined)
  const [ready, setReady] = useState(!isReturningFromRedirect)

  useEffect(() => {
    if (isReturningFromRedirect) {
      // Coming back from Google — wait for redirect result before routing
      getRedirectResult(auth)
        .catch(() => {})
        .finally(() => {
          localStorage.removeItem(REDIRECT_KEY)
          setReady(true)
        })
    }

    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      if (!isReturningFromRedirect) setReady(true)
    })

    return unsub
  }, [])

  return ready ? user : undefined
}
