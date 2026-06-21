import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function useTimetable(uid, childId) {
  const [timetable, setTimetable] = useState({})

  useEffect(() => {
    if (!uid || !childId) return
    return onSnapshot(
      collection(db, 'users', uid, 'children', childId, 'timetable'),
      snap => {
        const data = {}
        snap.docs.forEach(d => { data[d.id] = d.data().subjects || [] })
        DAYS.forEach(d => { if (!data[d]) data[d] = [] })
        setTimetable(data)
      }
    )
  }, [uid, childId])

  return timetable
}
