import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  UploadIcon,
  FileIcon,
  TrashIcon,
  CheckCircleIcon,
  InboxIcon,
  CheckIcon,
  XIcon
} from 'lucide-react'
import Button from '../components/Button'
import FileUpload from '../components/FileUpload'
import { useLocalStorageRequests } from '../hooks/useLocalStorageRequests'

interface FileItem {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: 'uploaded' | 'shared'
  ownerId: string
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const { requests, updateRequest } = useLocalStorageRequests(user?.id || '')

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Blood_Test_Results.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2023-05-15',
      status: 'shared',
      ownerId: user?.id || '',
    },
    {
      id: '2',
      name: 'MRI_Scan.dicom',
      type: 'DICOM',
      size: '15.8 MB',
      uploadDate: '2023-06-02',
      status: 'uploaded',
      ownerId: user?.id || '',
    },
  ])

  const [success, setSuccess] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Function to fetch files from Supabase
  const fetchFiles = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`http://127.0.0.1:8000/records/${user.id}`)
      const data = await res.json()

      if (data.records) {
        setFiles(
          data.records.map((record: any) => ({
            id: record.cid,
            name: record.file_url.split('/').pop(),
            type: record.file_url.split('.').pop()?.toUpperCase() || 'Unknown',
            size: '—',
            uploadDate: new Date(record.uploaded_at).toISOString().split('T')[0],
            status: 'uploaded',
            ownerId: user.id,
            file_url: record.file_url,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [user])

  const handleAccept = (id: string) => {
    updateRequest(id, 'accepted')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleDecline = (id: string) => {
    updateRequest(id, 'rejected')
  }

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const uploaded = e.target.files[0]

    const formData = new FormData()
    formData.append("file", uploaded)
    formData.append("user_id", user?.id || "")

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        console.error("Upload failed", data)
        return
      }

      // Add file info locally after successful upload
      const newFile: FileItem = {
        id: data.cid, // use CID as a unique ID
        name: uploaded.name,
        type: uploaded.name.split('.').pop()?.toUpperCase() || 'Unknown',
        size: formatFileSize(uploaded.size),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploaded',
        ownerId: user?.id || '',
      }

      // Update the local state
      setFiles((prev) => [newFile, ...prev])
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      
      // Refresh file list from the backend
      await fetchFiles()

    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <div className="text-gray-600 mt-2">
            <p>Welcome back, {user?.name}</p>
            {user?.dateOfBirth && (
              <p className="text-sm mt-1">Date of Birth: {new Date(user.dateOfBirth).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">Files shared successfully!</p>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">Files uploaded successfully!</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Medical Files</h2>\n<FileUpload userId={user?.id || ''} onUploadComplete={fetchFiles} />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Drag and drop files here, or click to select files</p>
          <div
            className="cursor-pointer inline-block"
            onClick={() => document.getElementById("hiddenFileInput")?.click()}
          >
            <Button variant="primary">Select Files</Button>
            <input
              type="file"
              id="hiddenFileInput"
              className="hidden"
              multiple
              onChange={handleFileInput}
            />
          </div>


          <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, JPEG, PNG, DICOM, and more</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Medical Files</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download Links</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <FileIcon className="text-gray-400 mr-2" size={18} />
                      {file.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{file.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{file.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{file.uploadDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {file.status === 'shared' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Shared</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://ipfs.io/ipfs/${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        IPFS
                      </a>
                      <a
                        href={file.file_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline block"
                      >
                        Supabase
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-900">
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">File Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <InboxIcon size={48} className="mx-auto mb-4" />
            <p>No pending file requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.filter((r) => r.status === 'pending').map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{request.providerName}</h3>
                    <p className="text-sm text-gray-600">{request.providerOrg}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(request.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{request.message}</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => handleDecline(request.id)}>
                    <XIcon size={16} className="mr-1" />
                    Decline
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleAccept(request.id)}>
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
