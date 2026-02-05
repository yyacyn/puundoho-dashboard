import './Dashboard.css'

function Dashboard({ user, onLogout }) {
    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <h2>Desa Puundoho</h2>
                </div>
                <div className="nav-user">
                    <span>Welcome, {user}</span>
                    <button onClick={onLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Manage your village profile content</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <div className="card-icon">📰</div>
                        <h3>News</h3>
                        <p className="card-count">0 Articles</p>
                        <button className="card-button">Manage News</button>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">🖼️</div>
                        <h3>Gallery</h3>
                        <p className="card-count">0 Photos</p>
                        <button className="card-button">Manage Gallery</button>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📊</div>
                        <h3>Statistics</h3>
                        <p className="card-count">0 Records</p>
                        <button className="card-button">Manage Stats</button>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3>Events</h3>
                        <p className="card-count">0 Events</p>
                        <button className="card-button">Manage Events</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
