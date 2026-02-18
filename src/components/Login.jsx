import { useState } from 'react'

function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault()
        if (username === 'admin' && password === 'admin123') {
            onLogin(username)
        } else {
            setError('Username atau password salah')
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0B] px-4">
            <div className="w-full max-w-sm bg-[#141417] border border-[#2A2A2E] rounded-2xl p-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col gap-1 text-center">
                    <span
                        className="text-white font-semibold tracking-[4px] text-base"
                        style={{ fontFamily: 'DM Mono, monospace' }}
                    >
                        PUUNDOHO
                    </span>
                    <p className="text-[#6B6B70] text-sm">Admin Dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#ADADB0] text-xs font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm placeholder:text-[#4A4A4E] outline-none focus:border-[#298064] transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#ADADB0] text-xs font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm placeholder:text-[#4A4A4E] outline-none focus:border-[#298064] transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors mt-1"
                    >
                        Login
                    </button>
                </form>

                {/* Footer hint */}
                <p className="text-[#4A4A4E] text-xs text-center">
                    Default: <span className="text-[#6B6B70]">admin</span> / <span className="text-[#6B6B70]">admin123</span>
                </p>
            </div>
        </div>
    )
}

export default Login

