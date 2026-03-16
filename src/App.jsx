import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import DashboardLayout from './components/DashboardLayout'

function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem('user'))
  const [role, setRole] = useState(() => sessionStorage.getItem('role') || 'admin')
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode')
    }
  }, [])

  const handleLogin = (username, userRole) => {
    sessionStorage.setItem('user', username)
    sessionStorage.setItem('role', userRole)
    setUser(username)
    setRole(userRole)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('role')
    setUser(null)
    setRole(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-['Inter',sans-serif]">
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />

        {/* Protected: dashboard + all nested pages */}
        <Route
          path="/dashboard/*"
          element={user
            ? <DashboardLayout user={user} role={role} onLogout={handleLogout} />
            : <Navigate to="/" replace />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
