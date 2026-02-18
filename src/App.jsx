import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (username) => {
    setIsLoggedIn(true)
    setUser(username)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-['Inter',sans-serif]">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
