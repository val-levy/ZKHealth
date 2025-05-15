import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, AlertCircleIcon } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
const BirthdayVerification = () => {
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  // Redirect if not logged in or if not a patient
  if (!user || user.role !== 'patient') {
    navigate('/signin')
    return null
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!birthday) {
      setError('Please enter your date of birth')
      return
    }
    // Compare with user's stored birthday
    if (birthday === user.dateOfBirth) {
      navigate('/patient-dashboard')
    } else {
      setError('Date of birth does not match our records')
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your Identity
          </h2>
          <p className="mt-2 text-gray-600">
            Please enter your date of birth to access your medical records
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <AlertCircleIcon className="text-red-500 mr-2" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="text-gray-400" size={18} />
                </div>
                <input
                  type="date"
                  id="birthday"
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <Button type="submit" variant="primary" fullWidth>
              Verify Identity
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default BirthdayVerification
