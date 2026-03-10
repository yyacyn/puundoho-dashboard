const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT token from sessionStorage.
 */
export async function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

    if (res.status === 401) {
        // Token expired / invalid — force logout
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        window.location.href = '/'
        throw new Error('Session expired')
    }

    return res
}

/**
 * Login and store JWT token + username
 */
export async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Login gagal')
    }

    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('user', data.username)

    return data
}

/**
 * Get ImageKit authentication parameters (server-signed)
 */
export async function getImageKitAuth() {
    const res = await apiFetch('/imagekit/auth')
    if (!res.ok) throw new Error('Failed to get ImageKit auth')
    return res.json()
}
