import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function useSharedTimetable(shareId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shareId) return
    getDoc(doc(db, 'sharedTimetables', shareId))
      .then(snap => {
        if (snap.exists()) setData(snap.data())
        else setError('not_found')
      })
      .catch(() => setError('failed'))
      .finally(() => setLoading(false))
  }, [shareId])

  return { data, loading, error }
}
