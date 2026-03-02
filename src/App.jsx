import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import DashboardLayout from './components/DashboardLayout'

function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem('user'))
  const navigate = useNavigate()

  const handleLogin = (username) => {
    sessionStorage.setItem('user', username)
    setUser(username)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
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
            ? <DashboardLayout user={user} onLogout={handleLogout} />
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
