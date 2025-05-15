import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrashIcon,
  ShareIcon,
  XIcon,
  UserIcon,
  InboxIcon,
  CheckIcon,
} from 'lucide-react'
import Button from '../components/Button'
interface FileItem {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: 'uploaded' | 'processing' | 'shared'
}
interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFiles: FileItem[]
  onShare: (doctorId: string) => void
}

interface FileRequest {
  id: string
  providerId: string
  providerName: string
  providerOrg: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: string
}
const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  selectedFiles,
  onShare,
}) => {
  const [doctorId, setDoctorId] = useState('')
  const [error, setError] = useState('')
  if (!isOpen) return null
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId.trim()) {
      setError('Please enter a doctor ID')
      return
    }
    onShare(doctorId)
    setDoctorId('')
    setError('')
  }
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share Medical Files</h3>
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
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selected files ({selectedFiles.length}):
          </p>
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="text-sm text-gray-700 py-1 flex items-center"
              >
                <FileIcon size={14} className="mr-2" />
                {file.name}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="doctorId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Doctor ID
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter doctor's ID"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Share Files
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
const PatientDashboard = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Blood_Test_Results.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2023-05-15',
      status: 'shared',
    },
    {
      id: '2',
      name: 'MRI_Scan.dicom',
      type: 'DICOM',
      size: '15.8 MB',
      uploadDate: '2023-06-02',
      status: 'uploaded',
    },
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [requests, setRequests] = useState<FileRequest[]>([
    {
      id: '1',
      providerId: '2',
      providerName: 'Dr. Jane Smith',
      providerOrg: 'City General Hospital',
      message:
        'Please share your recent blood test results for our upcoming appointment.',
      status: 'pending',
      timestamp: '2023-06-20T10:30:00Z',
    },
  ])
  const [isRespondingToRequest, setIsRespondingToRequest] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FileRequest | null>(
    null,
  )
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const handleDragLeave = () => {
    setDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      handleFileUpload(selectedFiles)
    }
  }
  const handleFileUpload = (uploadedFiles: File[]) => {
    // Simulate file upload
    const newFiles = uploadedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
      size: formatFileSize(file.size),
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'uploaded' as const,
    }))
    setFiles([...newFiles, ...files])
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
  }
  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
  }
  const handleFileSelection = (file: FileItem) => {
    if (selectedFiles.find((f) => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== file.id))
    } else {
      setSelectedFiles([...selectedFiles, file])
    }
  }
  const handleShare = (doctorId: string) => {
    // Simulate sharing files
    const updatedFiles = files.map((file) => {
      if (selectedFiles.find((f) => f.id === file.id)) {
        return {
          ...file,
          status: 'shared' as const,
        }
      }
      return file
    })
    setFiles(updatedFiles)
    setSelectedFiles([])
    setIsShareModalOpen(false)
    setIsSelectionMode(false)
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 3000)
  }
  const handleRequestResponse = (requestId: string, accepted: boolean) => {
    if (accepted) {
      setSelectedRequest(requests.find((r) => r.id === requestId) || null)
      setIsSelectionMode(true)
      setIsRespondingToRequest(true)
    } else {
      setRequests(
        requests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: 'rejected' as const,
              }
            : request,
        ),
      )
    }
  }
  const handleShareWithProvider = () => {
    if (!selectedRequest) return
    // Update request status
    setRequests(
      requests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: 'accepted' as const,
            }
          : request,
      ),
    )
    // Share selected files
    const updatedFiles = files.map((file) => {
      if (selectedFiles.find((f) => f.id === file.id)) {
        return {
          ...file,
          status: 'shared' as const,
        }
      }
      return file
    })
    setFiles(updatedFiles)
    setSelectedFiles([])
    setIsSelectionMode(false)
    setIsRespondingToRequest(false)
    setSelectedRequest(null)
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 3000)
  }
  const startSharing = () => {
    setIsSelectionMode(true)
  }
  const cancelSharing = () => {
    setIsSelectionMode(false)
    setSelectedFiles([])
  }
  const openShareModal = () => {
    if (selectedFiles.length === 0) {
      return
    }
    setIsShareModalOpen(true)
  }
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Dashboard
          </h1>
          <div className="text-gray-600 mt-2">
            <p>Welcome back, {user?.name}</p>
            {user?.dateOfBirth && (
              <p className="text-sm mt-1">
                Date of Birth: {new Date(user.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {isSelectionMode ? (
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={cancelSharing}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={openShareModal}
              disabled={selectedFiles.length === 0}
            >
              Share {selectedFiles.length} Files
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={startSharing}>
            <ShareIcon size={18} className="mr-2" />
            Share Files
          </Button>
        )}
      </div>
      {shareSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">Files shared successfully!</p>
          </div>
        </div>
      )}
      {uploadSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">Files uploaded successfully!</p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Medical Files</h2>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            multiple
            onChange={handleFileInput}
          />
          <label htmlFor="fileUpload">
            <Button variant="primary">
              Select Files
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, JPEG, PNG, DICOM, and more
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Medical Files</h2>
          {isRespondingToRequest && selectedRequest && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                Selecting files for {selectedRequest.providerName}
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedFiles.length === 0}
                onClick={handleShareWithProvider}
              >
                Share Selected Files
              </Button>
            </div>
          )}
        </div>
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileIcon size={48} className="mx-auto mb-4" />
            <p>You haven't uploaded any files yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isSelectionMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                  )}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className={
                      isSelectionMode ? 'cursor-pointer hover:bg-gray-50' : ''
                    }
                    onClick={
                      isSelectionMode
                        ? () => handleFileSelection(file)
                        : undefined
                    }
                  >
                    {isSelectionMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFiles.some((f) => f.id === file.id)}
                          onChange={() => handleFileSelection(file)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileIcon size={18} className="text-gray-400 mr-2" />
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {file.status === 'shared' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Shared
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Uploaded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedFiles={selectedFiles}
        onShare={handleShare}
      />
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">File Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <InboxIcon size={48} className="mx-auto mb-4" />
            <p>No pending file requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests
              .filter((r) => r.status === 'pending')
              .map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{request.providerName}</h3>
                      <p className="text-sm text-gray-600">
                        {request.providerOrg}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{request.message}</p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRequestResponse(request.id, false)}
                    >
                      <XIcon size={16} className="mr-1" />
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRequestResponse(request.id, true)}
                    >
                      <CheckIcon size={16} className="mr-1" />
                      Share Files
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default PatientDashboard
