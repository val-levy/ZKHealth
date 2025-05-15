import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import CreateAccount from './pages/CreateAccount'
import PatientDashboard from './pages/PatientDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import BirthdayVerification from './pages/BirthdayVerification'
// Protected route component to handle authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/signin" />
  }
  return children
}
// Route that redirects based on user type
const RoleBasedRoute = () => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/signin" />
  }
  if (user.role === 'patient') {
    return <Navigate to="/verify-birthday" />
  }
  return <Navigate to="/provider-dashboard" />
}
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/dashboard" element={<RoleBasedRoute />} />
              <Route
                path="/verify-birthday"
                element={<BirthdayVerification />}
              />
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider-dashboard"
                element={
                  <ProtectedRoute>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
