import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import axios from 'axios'
import MatrixRain from '../components/MatrixRain'
import ProgressRing from '../components/ProgressRing'
import FloatingParticles from '../components/FloatingParticles'

function Dashboard() {
  const { userId } = useParams()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/dashboard`)
      setDashboardData(response.data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-pulse">
          <div className="aperture-dramatic mx-auto mb-6"></div>
          <div className="text-2xl font-bold text-white mb-4">Loading Dashboard...</div>
          <div className="w-64 h-2 bg-white/20 rounded-full mx-auto">
            <div className="progress-enhanced h-full w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-bounceIn">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-300 mb-6 text-lg">{error}</div>
          <Link to="/" className="btn-danger">
            Start New Interview
          </Link>
        </div>
      </div>
    )
  }

  if (!dashboardData || dashboardData.sessions.length === 0) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-bounceIn">
          <div className="text-8xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Begin?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Start your first interview session to unlock your personalized analytics dashboard.
          </p>
          <Link to="/" className="btn-success">
            Launch First Interview
          </Link>
        </div>
      </div>
    )
  }

  const { sessions } = dashboardData
  const completedSessions = sessions.filter(s => s.completed)

  // Prepare chart data
  const chartData = completedSessions.map((session, index) => ({
    session: `Session ${index + 1}`,
    date: new Date(session.date).toLocaleDateString(),
    technical: session.avg_technical,
    communication: session.avg_communication,
    overall: session.overall_score
  }))

  const latestSession = completedSessions[completedSessions.length - 1]
  const averageOverall = completedSessions.reduce((sum, s) => sum + s.overall_score, 0) / completedSessions.length

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <MatrixRain opacity={0.02} speed={0.3} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative lens-content">
        {/* Dramatic Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="aperture-dramatic"></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <div className="aperture-dramatic"></div>
          </div>
          <p className="text-xl text-white/80 font-medium">
            Track your interview mastery journey
          </p>
        </div>

        {/* Enhanced Stats Overview with Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="card-glass text-center animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <ProgressRing 
              progress={(completedSessions.length / 10) * 100} 
              size={100} 
              color="#4facfe"
              label="Sessions"
              showPulse={completedSessions.length > 3}
            />
            <div className="mt-6">
              <div className="text-3xl font-bold text-blue-300 mb-2">
                {completedSessions.length}
              </div>
              <div className="text-sm text-white/70 font-medium">Total Sessions</div>
              {completedSessions.length > 5 && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    🔥 Streak Master
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-glass text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <ProgressRing 
              progress={averageOverall} 
              size={100} 
              color="#43e97b"
              label="Average"
            />
            <div className="mt-6">
              <div className="text-3xl font-bold text-green-300 mb-2">
                {Math.round(averageOverall)}
              </div>
              <div className="text-sm text-white/70 font-medium">Average Score</div>
              {averageOverall > 75 && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    ⭐ Excellence
                  </span>
                </div>
              )}
            </div>
          </div>

          {latestSession && (
            <>
              <div className="card-glass text-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                <ProgressRing 
                  progress={latestSession.overall_score} 
                  size={100} 
                  color="#f093fb"
                  label="Latest"
                  showPulse={latestSession.overall_score > 80}
                />
                <div className="mt-6">
                  <div className="text-3xl font-bold text-purple-300 mb-2">
                    {latestSession.overall_score}
                  </div>
                  <div className="text-sm text-white/70 font-medium">Latest Score</div>
                  {latestSession.overall_score > 85 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        🚀 Outstanding
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-glass text-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <div className="mt-8 mb-4">
                  <div className="text-6xl mb-4 animate-pulse">
                    {completedSessions.length > 1 ? 
                      (latestSession.overall_score > completedSessions[completedSessions.length - 2].overall_score ? 
                        <span className="text-green-400">📈</span> : 
                        <span className="text-red-400">📉</span>
                      )
                      : <span className="text-blue-400">🎯</span>
                    }
                  </div>
                  <div className="text-lg font-bold text-white mb-2">
                    {completedSessions.length > 1 ? 
                      (latestSession.overall_score > completedSessions[completedSessions.length - 2].overall_score ? 
                        'Improving' : 
                        'Adjusting'
                      )
                      : 'First Session'
                    }
                  </div>
                  <div className="text-sm text-white/70 font-medium">Trend Status</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Progress Chart */}
        {chartData.length > 1 && (
          <div className="card mb-12 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Score Evolution
            </h2>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4facfe" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="technicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#43e97b" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="communicationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="session" stroke="#6b7280" />
                  <YAxis domain={[0, 100]} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'technical' ? 'Technical' : name === 'communication' ? 'Communication' : 'Overall']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="overall"
                    stroke="#4facfe"
                    strokeWidth={3}
                    fill="url(#overallGradient)"
                    name="Overall"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="technical" 
                    stroke="#43e97b" 
                    strokeWidth={2}
                    name="Technical"
                    dot={{ fill: '#43e97b', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="communication" 
                    stroke="#f093fb" 
                    strokeWidth={2}
                    name="Communication"
                    dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Enhanced Session History */}
        <div className="card mb-12 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-3xl">📜</span>
            Session Timeline
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gradient-to-r from-blue-500 to-purple-500">
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Role</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Difficulty</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Overall</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Technical</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Communication</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={session.session_id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{session.role_title}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-2 text-sm font-bold rounded-full ${
                        session.difficulty === 'senior' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                        session.difficulty === 'mid' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-white ${
                        session.completed ? 
                          session.overall_score >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          session.overall_score >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gray-300 text-gray-600'
                      }`}>
                        {session.completed ? session.overall_score : '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-green-600 text-lg">
                        {session.completed && session.avg_technical ? session.avg_technical : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-purple-600 text-lg">
                        {session.completed ? session.avg_communication : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                        session.completed 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      }`}>
                        {session.completed ? '✅ Completed' : '⏳ In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="text-center animate-fadeInUp" style={{animationDelay: '1s'}}>
          <Link to="/" className="btn-primary group relative overflow-hidden">
            <span className="flex items-center justify-center gap-3 text-xl">
              <span className="text-2xl">🎯</span>
              Launch New Interview Session
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard