import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useChildren(uid) {
  const [children, setChildren] = useState([])

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'children'), orderBy('order'))
    return onSnapshot(q, snap => {
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [uid])

  return children
}
