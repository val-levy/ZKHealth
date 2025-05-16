import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  UserIcon,
  InboxIcon,
  XIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react'
import Button from '../components/Button'
import { useLocalStorageRequests, FileRequest } from '../hooks/useLocalStorageRequests'

const ProviderDashboard = () => {
  const { user } = useAuth()
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { sendRequest } = useLocalStorageRequests(user?.id || '')

  if (!user?.id) return <div>Loading...</div>

  const handleFileRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId.trim() || !message.trim()) {
      setError('Please fill in all fields')
      return
    }

    const newRequest: FileRequest = {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      providerId: user.id,
      providerName: user.name,
      providerOrg: user.providerOrg || '',
      message,
      status: 'pending',
      timestamp: new Date().toISOString(),
    }

    sendRequest(newRequest)
    setPatientId('')
    setMessage('')
    setError('')
    setIsRequestModalOpen(false)
    setRequestSuccess(true)
    setTimeout(() => setRequestSuccess(false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <div className="text-gray-600 mt-2">
            <p>Welcome back, {user.name}</p>
            {user.providerOrg && (
              <p className="text-sm mt-1">{user.providerOrg}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsRequestModalOpen(true)}>
          <InboxIcon size={18} className="mr-2" />
          Request Files
        </Button>
      </div>

      {requestSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">File request sent successfully!</p>
          </div>
        </div>
      )}

      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Request Medical Files</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertCircleIcon className="text-red-500 mr-2" size={20} />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleFileRequest}>
              <div className="mb-4">
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    id="patientId"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter patient's ID"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message to Patient</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Explain what files you need and why..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Send Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard
