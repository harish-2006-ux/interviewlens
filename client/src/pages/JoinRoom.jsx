import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingParticles from '../components/FloatingParticles'

function JoinRoom() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    roomId: '',
    role: 'candidate'
  })

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData(prev => ({ ...prev, roomId: id }))
  }

  const joinRoom = () => {
    if (!formData.name || !formData.roomId) {
      alert('Please fill in all fields')
      return
    }

    const questions = [
      { id: 'q1', text: 'Tell me about yourself and your background.', type: 'behavioral', sequence_no: 1 },
      { id: 'q2', text: 'How would you approach solving a complex technical problem?', type: 'technical', sequence_no: 2 },
      { id: 'q3', text: 'Describe a challenging project you worked on.', type: 'behavioral', sequence_no: 3 },
      { id: 'q4', text: 'What are your strengths and areas for improvement?', type: 'behavioral', sequence_no: 4 },
      { id: 'q5', text: 'How do you handle working under pressure and tight deadlines?', type: 'behavioral', sequence_no: 5 },
      { id: 'q6', text: 'Explain a technical concept you recently learned.', type: 'technical', sequence_no: 6 },
      { id: 'q7', text: 'Why are you interested in this role and our company?', type: 'fit', sequence_no: 7 }
    ]

    navigate(`/video-interview/${formData.roomId}/${formData.role}`, {
      state: {
        questions,
        userId: 'user-' + Date.now(),
        roleTitle: 'Software Engineer',
        userName: formData.name
      }
    })
  }

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <div className="scan-lines"></div>
      
      <div className="max-w-2xl mx-auto pt-20 px-4 lens-content">
        <div className="card animate-bounceIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="aperture-dramatic" style={{width: '60px', height: '60px'}}></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Video Interview Room
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Connect with your interview partner for a live video session
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Panel - Form */}
            <div className="space-y-6">
              <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Choose Your Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, role: 'candidate' }))}
                    className={`p-4 rounded-xl border-3 transition-all duration-300 text-center transform hover:scale-105 ${
                      formData.role === 'candidate' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-xl' 
                        : 'border-gray-200 hover:border-blue-300 bg-white/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="text-3xl mb-2">🧑‍💻</div>
                    <div className="font-bold">Candidate</div>
                    <div className="text-sm text-gray-600 mt-1">Being interviewed</div>
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, role: 'interviewer' }))}
                    className={`p-4 rounded-xl border-3 transition-all duration-300 text-center transform hover:scale-105 ${
                      formData.role === 'interviewer' 
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-xl' 
                        : 'border-gray-200 hover:border-green-300 bg-white/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="text-3xl mb-2">👔</div>
                    <div className="font-bold">Interviewer</div>
                    <div className="text-sm text-gray-600 mt-1">Conducting interview</div>
                  </button>
                </div>
              </div>

              <div className="animate-fadeInUp" style={{animationDelay: '0.6s'}}>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Room ID *
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value.toUpperCase() }))}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-mono text-lg bg-white/50 backdrop-blur-sm"
                    placeholder="ENTER ID"
                    maxLength={6}
                  />
                  <button
                    onClick={generateRoomId}
                    className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200"
                    title="Generate random room ID"
                  >
                    <span className="text-2xl">🎲</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <span>💡</span>
                  Share this 6-character ID with your interview partner
                </p>
              </div>
            </div>

            {/* Right Panel - Instructions */}
            <div className="animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>📋</span> How It Works
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: "1️⃣", text: "Choose your role (Candidate or Interviewer)" },
                    { icon: "2️⃣", text: "Generate a room ID or enter one shared with you" },
                    { icon: "3️⃣", text: "Share the room ID with your partner" },
                    { icon: "4️⃣", text: "Both join the same room to start the video interview" }
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-0 animate-fadeInUp" 
                         style={{animationDelay: `${1.2 + i * 0.1}s`, animationFillMode: 'forwards'}}>
                      <span className="text-2xl">{step.icon}</span>
                      <span className="text-purple-800 font-medium">{step.text}</span>
                    </div>
                  ))}
                </div>

                {/* Connection Status */}
                <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-semibold">WebRTC Server Online</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Ready for real-time video connections</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 space-y-4 animate-fadeInUp" style={{animationDelay: '1s'}}>
            <button
              onClick={joinRoom}
              disabled={!formData.roomId || !formData.name}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="flex items-center justify-center gap-3 text-xl">
                <span className="text-2xl">🚀</span>
                Join Interview Room
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
            
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary px-8 py-2 text-base"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Live Demo Hint */}
          {formData.roomId && formData.name && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 animate-bounceIn">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                <span className="font-bold text-green-800">
                  Ready to Connect! Room ID: <span className="font-mono bg-white px-2 py-1 rounded">{formData.roomId}</span>
                </span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Share this room ID with your partner and click "Join Interview Room" when both are ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinRoom