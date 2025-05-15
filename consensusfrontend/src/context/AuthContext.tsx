import React, { useState, createContext, useContext } from 'react'
// Define user type
type User = {
  id: string
  name: string
  email: string
  role: 'patient' | 'provider'
  dateOfBirth?: string // For patients
  providerOrg?: string // For providers
}
// Define context type
type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (
    name: string,
    email: string,
    password: string,
    role: 'patient' | 'provider',
    extraInfo: {
      dateOfBirth?: string
      providerOrg?: string
    },
  ) => boolean
  logout: () => void
}
// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)
// Sample users for demo purposes
const sampleUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'patient@example.com',
    password: 'password123',
    role: 'patient' as const,
    dateOfBirth: '1985-04-12',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'doctor@example.com',
    password: 'password123',
    role: 'provider' as const,
    providerOrg: 'City General Hospital',
  },
]
export const AuthProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState(sampleUsers)
  const login = (email: string, password: string) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password,
    )
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      return true
    }
    return false
  }
  const register = (
    name: string,
    email: string,
    password: string,
    role: 'patient' | 'provider',
    extraInfo: {
      dateOfBirth?: string
      providerOrg?: string
    },
  ) => {
    if (users.some((u) => u.email === email)) {
      return false
    }
    const newUser =
      role === 'patient'
        ? {
            id: `${users.length + 1}`,
            name,
            email,
            password,
            role,
            dateOfBirth: extraInfo.dateOfBirth ?? '',
            providerOrg: undefined,
          }
        : {
            id: `${users.length + 1}`,
            name,
            email,
            password,
            role,
            providerOrg: extraInfo.providerOrg ?? '',
            dateOfBirth: undefined,
          }
    setUsers([...users, newUser])
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    return true
  }
  const logout = () => {
    setUser(null)
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
