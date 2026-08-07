import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar relative z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="aperture-dramatic relative" style={{width: '50px', height: '50px'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                InterviewLens
              </span>
              <div className="text-sm text-gray-500 font-medium">AI Interview Analysis</div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`relative px-4 py-2 font-semibold transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              )}
            </Link>
            
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎥</span>
                <span>Video Interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span>Word-level Insights</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-800">System Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-50"></div>
    </nav>
  )
}

export default Navbar