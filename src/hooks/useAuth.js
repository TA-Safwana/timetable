import { useState, useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = signed out
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let authResolved = false
    let redirectResolved = false
    let resolvedUser = undefined

    function trySetReady() {
      if (authResolved && redirectResolved) {
        setUser(resolvedUser)
        setReady(true)
      }
    }

    const unsub = onAuthStateChanged(auth, u => {
      resolvedUser = u
      authResolved = true
      trySetReady()
    })

    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => {
        redirectResolved = true
        trySetReady()
      })

    return unsub
  }, [])

  return ready ? user : undefined
}
