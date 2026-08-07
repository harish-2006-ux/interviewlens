import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function VideoRoomSetup() {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')
  const [mode, setMode] = useState('candidate')
  const [name, setName] = useState('')

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(id)
  }

  const joinRoom = () => {
    if (!roomId || !name) {
      alert('Please fill in all fields')
      return
    }

    const questions = [
      { id: 'q1', text: 'Tell me about yourself and your background.', type: 'behavioral', sequence_no: 1 },
      { id: 'q2', text: 'How would you approach solving a complex technical problem?', type: 'technical', sequence_no: 2 },
      { id: 'q3', text: 'Describe a challenging project you worked on.', type: 'behavioral', sequence_no: 3 },
      { id: 'q4', text: 'What are your strengths and weaknesses?', type: 'behavioral', sequence_no: 4 },
      { id: 'q5', text: 'How do you handle working under pressure?', type: 'behavioral', sequence_no: 5 }
    ]

    navigate(`/video-interview/${roomId}/${mode}`, {
      state: {
        questions,
        userId: 'user-' + Date.now(),
        roleTitle: 'Software Engineer',
        userName: name
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🎥 Setup Video Interview
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('candidate')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mode === 'candidate' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🧑‍💻 Candidate
              </button>
              <button
                onClick={() => setMode('interviewer')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mode === 'interviewer' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                👔 Interviewer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter or generate room ID"
              />
              <button
                onClick={generateRoomId}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                🎲
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this ID with your interview partner
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={joinRoom}
              disabled={!roomId || !name}
              className="w-full btn-primary disabled:opacity-50"
            >
              🚀 Start Video Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoRoomSetup