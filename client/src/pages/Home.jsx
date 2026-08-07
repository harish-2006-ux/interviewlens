import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TypewriterSubtitle from '../components/TypewriterSubtitle'
import FloatingParticles from '../components/FloatingParticles'

function Home() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target_role: '',
    resume_text: '',
    difficulty: 'mid'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Trigger all effects after component mounts
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.target_role) {
      alert('Please fill in required fields')
      return
    }

    setLoading(true)
    try {
      // Create/get user
      const userResponse = await axios.post('/api/users', {
        name: formData.name,
        target_role: formData.target_role,
        resume_text: formData.resume_text
      })

      // Start session
      const sessionResponse = await axios.post('/api/sessions/start', {
        user_id: userResponse.data._id,
        role_title: formData.target_role,
        difficulty: formData.difficulty
      })

      // Navigate to interview
      navigate(`/interview/${sessionResponse.data.session_id}`, {
        state: { 
          questions: sessionResponse.data.questions,
          userId: userResponse.data._id,
          roleTitle: formData.target_role
        }
      })
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start interview session')
    } finally {
      setLoading(false)
    }
  }

  const handleDashboard = async () => {
    // For demo, try to find the seeded user
    try {
      const response = await axios.post('/api/users', {
        name: 'John Developer',
        target_role: 'Full Stack Developer',
        resume_text: 'Experienced in React, Node.js, MongoDB. Built several web applications.'
      })
      navigate(`/dashboard/${response.data._id}`)
    } catch (error) {
      alert('Please run "npm run seed" first to create demo data, or start a new interview session')
    }
  }

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <div className="scan-lines"></div>
      
      <div className="max-w-4xl mx-auto relative lens-content px-4">
        <div className="text-center py-20">
          {/* Dramatic Header */}
          <div className="flex items-center justify-center gap-6 mb-8 animate-fadeInUp">
            <div className="aperture-dramatic"></div>
            <h1 className="lens-title">
              InterviewLens
            </h1>
            <div className="aperture-dramatic"></div>
          </div>
          
          <div className="animate-fadeInUp" style={{animationDelay: '1s'}}>
            <TypewriterSubtitle 
              text="See exactly where you lost the interview." 
              delay={2000}
              speed={50}
            />
          </div>
          
          <div className="text-xl text-white/90 mb-12 opacity-0 font-medium" 
               style={{animation: 'fadeInUp 1s ease-out 4s forwards'}}>
            Two scores, word-level evidence. Not just what you scored — why.
          </div>
          
          {/* Animated Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            {[
              { 
                icon: "🎯", 
                title: "Dual Scoring", 
                desc: "Technical & Communication analysis",
                delay: "3s" 
              },
              { 
                icon: "⚡", 
                title: "Real-time Analysis", 
                desc: "Instant word-level feedback",
                delay: "3.2s" 
              },
              { 
                icon: "🔍", 
                title: "Deep Insights", 
                desc: "See exactly what went wrong",
                delay: "3.4s" 
              }
            ].map((feature, i) => (
              <div key={i} className="card-glass opacity-0 text-center" 
                   style={{animation: `bounceIn 0.8s ease-out ${feature.delay} forwards`}}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Action Panel */}
        <div className="max-w-lg mx-auto opacity-0" style={{animation: 'slideInRight 1s ease-out 5s forwards'}}>
          <div className="card relative">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Choose Your Experience
            </h2>
            
            <div className="space-y-6">
              <button
                onClick={() => navigate('/join-room')}
                className="btn-primary w-full group relative"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎥</span>
                  Real Video Interview
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
              
              <button
                onClick={() => navigate('/video-interview/demo-session/candidate', { 
                  state: { 
                    questions: [
                      { id: 'demo-1', text: 'Tell me about yourself and your background.', type: 'behavioral', sequence_no: 1 },
                      { id: 'demo-2', text: 'How would you approach solving a complex technical problem?', type: 'technical', sequence_no: 2 },
                      { id: 'demo-3', text: 'Describe a challenging project you worked on.', type: 'behavioral', sequence_no: 3 }
                    ], 
                    userId: 'demo-user-1', 
                    roleTitle: 'Software Engineer' 
                  }
                })}
                className="btn-success w-full group relative"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🤖</span>
                  AI Demo Interview
                </span>
              </button>
              
              <button
                onClick={() => navigate('/interview/demo-session', { 
                  state: { 
                    questions: [
                      { id: 'demo-1', text: 'How would you approach analyzing a large dataset?', type: 'technical', sequence_no: 1 }
                    ], 
                    userId: 'demo-user-1', 
                    roleTitle: 'Software Engineer' 
                  }
                })}
                className="btn-secondary w-full group relative"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📝</span>
                  Text Practice Mode
                </span>
              </button>
              
              <button
                onClick={handleDashboard}
                className="btn-warning w-full group relative"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📊</span>
                  Progress Dashboard
                </span>
              </button>
            </div>

            {/* Floating Action Hint */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white/70 animate-pulse">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <span className="text-sm font-medium">Choose any option to begin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Stats */}
        <div className="text-center py-16">
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[
              { number: "2", label: "Scoring Systems", suffix: "" },
              { number: "7", label: "AI Questions", suffix: "+" },
              { number: "100", label: "Analysis Points", suffix: "%" }
            ].map((stat, i) => (
              <div key={i} className="opacity-0" 
                   style={{animation: `fadeInUp 0.6s ease-out ${6 + i * 0.2}s forwards`}}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.number}<span className="text-2xl text-purple-300">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home