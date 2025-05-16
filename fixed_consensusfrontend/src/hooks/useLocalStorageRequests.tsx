import { useState, useEffect } from 'react'

export interface FileRequest {
  id: string
  patientId: string
  providerId: string
  providerName: string
  providerOrg: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: string
}

export const useLocalStorageRequests = (userId: string) => {
  const [requests, setRequests] = useState<FileRequest[]>([])

  useEffect(() => {
    const sync = () => {
      const all = JSON.parse(localStorage.getItem('requests') || '[]')
      setRequests(all.filter((r: FileRequest) => r.patientId === userId))
    }

    sync()

    const listener = (e: StorageEvent) => {
      if (e.key === 'requests') sync()
    }

    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }, [userId])

  const sendRequest = (req: FileRequest) => {
    const all = JSON.parse(localStorage.getItem('requests') || '[]')
    const updated = [...all, req]
    localStorage.setItem('requests', JSON.stringify(updated))
    window.dispatchEvent(new StorageEvent('storage', { key: 'requests', newValue: JSON.stringify(updated) }))
  }

  const updateRequest = (id: string, status: 'accepted' | 'rejected') => {
    const all = JSON.parse(localStorage.getItem('requests') || '[]')
    const updated = all.map((r: FileRequest) => r.id === id ? { ...r, status } : r)
    localStorage.setItem('requests', JSON.stringify(updated))
    window.dispatchEvent(new StorageEvent('storage', { key: 'requests', newValue: JSON.stringify(updated) }))
  }

  return { requests, sendRequest, updateRequest }
}
