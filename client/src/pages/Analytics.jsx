import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FloatingParticles from '../components/FloatingParticles'
import MatrixRain from '../components/MatrixRain'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function Analytics() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [userMetrics, setUserMetrics] = useState(null)
  const [sessionMetrics, setSessionMetrics] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [communicationMetrics, setCommunicationMetrics] = useState(null)
  const [technicalMetrics, setTechnicalMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(dateRange)

      const [overviewRes, usersRes, sessionsRes, performanceRes, commRes, techRes] = await Promise.all([
        axios.get('/api/analytics/overview'),
        axios.get('/api/analytics/users'),
        axios.get(`/api/analytics/sessions?${params}`),
        axios.get(`/api/analytics/performance?${params}`),
        axios.get('/api/analytics/communication'),
        axios.get('/api/analytics/technical')
      ])

      setOverview(overviewRes.data)
      setUserMetrics(usersRes.data)
      setSessionMetrics(sessionsRes.data)
      setPerformanceData(performanceRes.data)
      setCommunicationMetrics(commRes.data)
      setTechnicalMetrics(techRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-opacity-20 border-white shadow-lg hover:shadow-2xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-white/60 text-xs mt-2">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </div>
  )

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-pulse">
          <div className="aperture-dramatic mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-white">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <MatrixRain opacity={0.02} speed={0.3} />

      <div className="max-w-7xl mx-auto p-6 relative lens-content">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="aperture-dramatic" style={{ width: '50px', height: '50px' }}></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-xl text-white/90">
            Comprehensive insights into your interview platform performance
          </p>
        </div>

        {/* Date Filter */}
        <div className="card mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {['overview', 'performance', 'users', 'sessions', 'communication', 'technical'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={overview.totalUsers}
                icon="👥"
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Total Sessions"
                value={overview.totalSessions}
                icon="🎤"
                color="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Completion Rate"
                value={`${overview.completionRate}%`}
                subtitle={`${overview.completedSessions}/${overview.totalSessions} completed`}
                icon="✅"
                color="from-purple-500 to-pink-500"
              />
              <StatCard
                title="Avg Overall Score"
                value={overview.avgOverallScore}
                icon="⭐"
                color="from-orange-500 to-red-500"
              />
              <StatCard
                title="Avg Technical Score"
                value={overview.avgTechnical}
                icon="🔧"
                color="from-indigo-500 to-blue-500"
              />
              <StatCard
                title="Avg Communication Score"
                value={overview.avgCommunication}
                icon="💬"
                color="from-pink-500 to-rose-500"
              />
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performanceData && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="card">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="overallScore" stroke="#3b82f6" name="Overall Score" strokeWidth={2} />
                  <Line type="monotone" dataKey="technicalScore" stroke="#10b981" name="Technical Score" strokeWidth={2} />
                  <Line type="monotone" dataKey="communicationScore" stroke="#f59e0b" name="Communication Score" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && userMetrics && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Total Users</h3>
                <p className="text-5xl font-bold text-blue-600">{userMetrics.totalUsers}</p>
              </div>
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Users</h3>
                <div className="space-y-3">
                  {userMetrics.userActivity.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.role}</p>
                      </div>
                      <p className="font-bold text-blue-600">{user.sessions} sessions</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && sessionMetrics && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                title="Total Sessions"
                value={sessionMetrics.totalSessions}
                icon="🎤"
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Completion Rate"
                value={`${sessionMetrics.completionRate}%`}
                icon="✅"
                color="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Avg Duration"
                value={`${sessionMetrics.avgDuration}m`}
                icon="⏱️"
                color="from-purple-500 to-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sessions by Difficulty</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sessionMetrics.sessionsByDifficulty}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {sessionMetrics.sessionsByDifficulty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sessions by Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessionMetrics.sessionsByRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && communicationMetrics && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Responses Analyzed"
                value={communicationMetrics.totalResponses}
                icon="📊"
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Avg Filler Words"
                value={communicationMetrics.avgFillerWordsPerResponse}
                icon="💬"
                color="from-orange-500 to-red-500"
              />
              <StatCard
                title="STAR Usage"
                value={`${communicationMetrics.starStructureUsage}%`}
                icon="⭐"
                color="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Responses w/ Hedges"
                value={communicationMetrics.responsesWithHedges}
                icon="🤔"
                color="from-purple-500 to-pink-500"
              />
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Filler Words</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={communicationMetrics.topFillerWords} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="word" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Technical Tab */}
        {activeTab === 'technical' && technicalMetrics && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StatCard
                title="Avg Technical Score"
                value={technicalMetrics.avgScore}
                icon="🔧"
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Total Responses"
                value={technicalMetrics.totalResponses}
                icon="📝"
                color="from-purple-500 to-pink-500"
              />
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Excellent (80+)', value: technicalMetrics.scoreDistribution.excellent },
                      { name: 'Good (60-80)', value: technicalMetrics.scoreDistribution.good },
                      { name: 'Average (40-60)', value: technicalMetrics.scoreDistribution.average },
                      { name: 'Poor (<40)', value: technicalMetrics.scoreDistribution.poor }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-8 flex gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => window.open('/api/analytics/export?format=json')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            📊 Export Report (JSON)
          </button>
          <button
            onClick={() => window.open('/api/analytics/export?format=csv')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            📋 Export Report (CSV)
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Analytics
