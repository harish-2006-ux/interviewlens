import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar relative z-50">
      <div className="nav-shell">
        <Link to="/" className="brand-mark">
          <span className="brand-symbol"><i /></span>
          <span><strong>InterviewLens</strong><small>Practice with evidence</small></span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/join-room" className={location.pathname.startsWith('/join-room') ? 'active' : ''}>Live Room</Link>
          <span className="nav-divider" />
          <span className="nav-status"><i /> Live system</span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
