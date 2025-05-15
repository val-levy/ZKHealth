import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  UserIcon,
  SearchIcon,
  FileIcon,
  DownloadIcon,
  EyeIcon,
  InboxIcon,
  XIcon,
  SendIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react'
import Button from '../components/Button'
interface Patient {
  id: string
  name: string
  email: string
  dateOfBirth: string
  lastVisit: string
  files: number
}
interface PatientFile {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  patientName: string
}
interface FileRequest {
  id: string
  patientId: string
  providerId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: string
}
interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (patientId: string, message: string) => void
}
const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [patientId, setPatientId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!isOpen) return null
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId.trim() || !message.trim()) {
      setError('Please fill in all fields')
      return
    }
    onSubmit(patientId, message)
    setPatientId('')
    setMessage('')
    setError('')
  }
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Request Medical Files</h3>
          <button
            onClick={onClose}
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient ID
            </label>
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
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message to Patient
            </label>
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
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
const ProviderDashboard = () => {
  const { user } = useAuth()
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  // Sample data
  const patients: Patient[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '1985-04-12',
      lastVisit: '2023-06-15',
      files: 3,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      dateOfBirth: '1990-08-23',
      lastVisit: '2023-05-30',
      files: 2,
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      dateOfBirth: '1978-11-05',
      lastVisit: '2023-06-02',
      files: 5,
    },
  ]
  const patientFiles: Record<string, PatientFile[]> = {
    '1': [
      {
        id: '101',
        name: 'Blood_Test_Results.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadDate: '2023-05-15',
        patientName: 'John Doe',
      },
      {
        id: '102',
        name: 'Chest_X-Ray.dicom',
        type: 'DICOM',
        size: '8.7 MB',
        uploadDate: '2023-06-15',
        patientName: 'John Doe',
      },
      {
        id: '103',
        name: 'Medical_History.pdf',
        type: 'PDF',
        size: '1.2 MB',
        uploadDate: '2023-04-30',
        patientName: 'John Doe',
      },
    ],
    '2': [
      {
        id: '201',
        name: 'Allergy_Test.pdf',
        type: 'PDF',
        size: '1.8 MB',
        uploadDate: '2023-05-30',
        patientName: 'Sarah Johnson',
      },
      {
        id: '202',
        name: 'MRI_Results.dicom',
        type: 'DICOM',
        size: '15.2 MB',
        uploadDate: '2023-05-28',
        patientName: 'Sarah Johnson',
      },
    ],
    '3': [
      {
        id: '301',
        name: 'Cardiology_Report.pdf',
        type: 'PDF',
        size: '3.1 MB',
        uploadDate: '2023-06-02',
        patientName: 'Michael Brown',
      },
      {
        id: '302',
        name: 'ECG_Results.pdf',
        type: 'PDF',
        size: '1.5 MB',
        uploadDate: '2023-06-02',
        patientName: 'Michael Brown',
      },
      {
        id: '303',
        name: 'Blood_Work.pdf',
        type: 'PDF',
        size: '2.2 MB',
        uploadDate: '2023-05-20',
        patientName: 'Michael Brown',
      },
      {
        id: '304',
        name: 'CT_Scan.dicom',
        type: 'DICOM',
        size: '22.8 MB',
        uploadDate: '2023-05-15',
        patientName: 'Michael Brown',
      },
      {
        id: '305',
        name: 'Medical_History.pdf',
        type: 'PDF',
        size: '4.3 MB',
        uploadDate: '2023-04-10',
        patientName: 'Michael Brown',
      },
    ],
  }
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const handleFileRequest = (patientId: string, message: string) => {
    // Simulate sending request
    console.log(
      'Requesting files from patient:',
      patientId,
      'Message:',
      message,
    )
    setIsRequestModalOpen(false)
    setRequestSuccess(true)
    setTimeout(() => setRequestSuccess(false), 3000)
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <div className="text-gray-600 mt-2">
            <p>Welcome back, {user?.name}</p>
            {user?.providerOrg && (
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Patients</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {patients.length} Total
              </span>
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No patients found
                </p>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPatient === patient.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Last visit: {patient.lastVisit}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {patient.files} Files
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {!selectedPatient ? (
              <div className="text-center py-16">
                <FileIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Patient Selected
                </h3>
                <p className="text-gray-500">
                  Select a patient to view their medical files
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  const patient = patients.find((p) => p.id === selectedPatient)
                  return (
                    <div className="mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {patient?.name}'s Medical Files
                          </h2>
                          <p className="text-sm text-gray-500">
                            Date of Birth: {patient?.dateOfBirth} | Email:{' '}
                            {patient?.email}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Contact Patient
                        </Button>
                      </div>
                    </div>
                  )
                })()}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientFiles[selectedPatient]?.map((file) => (
                        <tr key={file.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileIcon
                                size={18}
                                className="text-gray-400 mr-2"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.uploadDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon size={18} />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <DownloadIcon size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleFileRequest}
      />
    </div>
  )
}
export default ProviderDashboard
