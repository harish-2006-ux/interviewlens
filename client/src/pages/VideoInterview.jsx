import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import VideoChat from '../components/VideoChat'
import VoiceInput from '../components/VoiceInput'
import ConfidenceHeatmap from '../components/ConfidenceHeatmap'
import MatrixRain from '../components/MatrixRain'
import FloatingParticles from '../components/FloatingParticles'
import axios from 'axios'

function VideoInterview() {
  const { sessionId, mode } = useParams() // mode: 'interviewer' or 'candidate'
  const location = useLocation()
  const navigate = useNavigate()
  
  const [questions, setQuestions] = useState(location.state?.questions || [])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [isVideoConnected, setIsVideoConnected] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  
  const isInterviewer = mode === 'interviewer'
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex >= questions.length - 1

  useEffect(() => {
    setStartTime(Date.now())
  }, [currentQuestionIndex])

  useEffect(() => {
    // Add welcome message
    if (isVideoConnected) {
      setChatMessages([{
        id: 1,
        sender: isInterviewer ? 'system' : 'interviewer',
        text: isInterviewer 
          ? 'Welcome! You are conducting this interview session.' 
          : 'Hello! I\'m your interviewer today. Let\'s begin when you\'re ready.',
        timestamp: Date.now()
      }])
    }
  }, [isVideoConnected, isInterviewer])

  const submitAnswer = async () => {
    if (!answer.trim() && !isInterviewer) {
      alert('Please provide an answer before proceeding')
      return
    }

    if (isInterviewer) {
      // Interviewer asking the next question
      moveToNextQuestion()
      return
    }

    setLoading(true)
    const responseTimeSeconds = startTime ? (Date.now() - startTime) / 1000 : 0

    try {
      const response = await axios.post('/api/sessions/answer', {
        question_id: currentQuestion.id,
        answer_text: answer,
        input_mode: isRecording ? 'voice' : 'text',
        response_time_sec: responseTimeSeconds
      })

      const newResponse = {
        question: currentQuestion,
        answer,
        score: response.data.score,
        responseTime: responseTimeSeconds
      }
      setResponses(prev => [...prev, newResponse])

      // Add answer to chat
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'candidate',
        text: answer,
        timestamp: Date.now(),
        score: response.data.score
      }])

      if (response.data.follow_up_question) {
        setQuestions(prev => {
          const newQuestions = [...prev]
          newQuestions.splice(currentQuestionIndex + 1, 0, response.data.follow_up_question)
          return newQuestions
        })
      }

      if (isLastQuestion) {
        finishInterview()
      } else {
        moveToNextQuestion()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const moveToNextQuestion = () => {
    if (isLastQuestion) {
      finishInterview()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setAnswer('')
      setStartTime(Date.now())
      
      // Add next question to chat
      const nextQuestion = questions[currentQuestionIndex + 1]
      if (nextQuestion) {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'interviewer',
          text: nextQuestion.text,
          timestamp: Date.now(),
          questionType: nextQuestion.type
        }])
      }
    }
  }

  const finishInterview = async () => {
    try {
      const response = await axios.post(`/api/sessions/${sessionId}/summary`)
      navigate(`/report/${sessionId}`, {
        state: { 
          summary: response.data,
          responses,
          userId: location.state?.userId
        }
      })
    } catch (error) {
      console.error('Error finishing interview:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setAnswer(transcript)
  }

  const sendMessage = (message) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: isInterviewer ? 'interviewer' : 'candidate',
      text: message,
      timestamp: Date.now()
    }])
  }

  if (!currentQuestion && questions.length > 0) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-pulse">
          <div className="aperture-dramatic mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-white">Loading interview questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <MatrixRain opacity={0.02} speed={0.3} />
      
      <div className="max-w-7xl mx-auto p-6 relative lens-content">
        {/* Enhanced Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="aperture-dramatic"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Live Video Interview
            </h1>
            <div className="aperture-dramatic"></div>
          </div>
          <p className="text-xl text-white/90 font-medium">
            {isInterviewer ? '🎯 Conducting Interview Session' : '🎤 Interactive Interview Experience'}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Video Chat Section */}
          <div className="xl:col-span-2">
            <div className="card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🎥</span>
                  Video Connection
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isVideoConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isVideoConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                  }`}></div>
                  {isVideoConnected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
              <VideoChat
                isInterviewer={isInterviewer}
                onConnectionChange={setIsVideoConnected}
                roomId={sessionId}
                userInfo={{
                  name: location.state?.userName || 'Anonymous',
                  role: isInterviewer ? 'interviewer' : 'candidate'
                }}
              />
            </div>
          </div>

          {/* Enhanced Controls Panel */}
          <div className="space-y-6">
            {/* Enhanced Progress */}
            <div className="card animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Progress
              </h3>
              <div className="text-lg font-medium text-gray-700 mb-3">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="progress-enhanced h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </div>
            </div>

            {/* Enhanced Current Question */}
            {currentQuestion && (
              <div className="card animate-fadeInUp" style={{animationDelay: '0.6s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-2 text-sm font-bold rounded-2xl ${
                    currentQuestion.type === 'technical' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    currentQuestion.type === 'behavioral' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {currentQuestion.type.toUpperCase()}
                  </span>
                  {currentQuestion.is_followup && (
                    <span className="px-3 py-2 text-sm font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      FOLLOW-UP
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">❓</span>
                  Current Question:
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                  <p className="text-gray-800 font-medium leading-relaxed">{currentQuestion.text}</p>
                </div>

                {!isInterviewer && (
                  <>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      rows={4}
                      placeholder="Type your answer or use voice input..."
                    />

                    <VoiceInput 
                      onTranscript={handleVoiceTranscript}
                      onRecordingChange={setIsRecording}
                    />
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  {isInterviewer ? (
                    <button
                      onClick={moveToNextQuestion}
                      className="flex-1 btn-primary"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">{isLastQuestion ? '🏁' : '➡️'}</span>
                        {isLastQuestion ? 'End Interview' : 'Next Question'}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={submitAnswer}
                      disabled={loading || !answer.trim()}
                      className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">
                          {loading ? '⏳' : isLastQuestion ? '🏁' : '✅'}
                        </span>
                        {loading ? 'Processing...' : 
                         isLastQuestion ? 'Finish Interview' : 'Submit Answer'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Interview Chat */}
            <div className="card animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💬</span>
                Interview Chat
              </h3>
              <div className="h-64 overflow-y-auto space-y-3 mb-3 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                {chatMessages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-xl max-w-xs animate-fadeInUp ${
                      message.sender === 'interviewer' 
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 mr-auto border-2 border-blue-300' 
                        : message.sender === 'candidate'
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 ml-auto border-2 border-green-300'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 mx-auto text-center border-2 border-gray-300'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="font-medium">{message.text}</div>
                    {message.score && (
                      <div className="text-xs mt-2 opacity-75 flex gap-2">
                        <span>📊 {message.score.communication_score}/100</span>
                        {message.score.technical_score && (
                          <span>🔧 {message.score.technical_score}/100</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Recent Scores */}
            {responses.length > 0 && (
              <div className="card animate-fadeInUp" style={{animationDelay: '1s'}}>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Recent Performance
                </h3>
                <div className="space-y-3">
                  {responses.slice(-2).map((resp, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                      <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">Q{responses.length - 1 - index}:</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          resp.question.type === 'technical' ? 'bg-blue-500 text-white' :
                          resp.question.type === 'behavioral' ? 'bg-green-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {resp.question.type}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm font-medium text-gray-700">
                        {resp.score.technical_score && (
                          <span className="flex items-center gap-1">
                            <span className="text-blue-500">🔧</span>
                            Technical: {resp.score.technical_score}/100
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="text-purple-500">💬</span>
                          Communication: {resp.score.communication_score}/100
                        </span>
                      </div>
                      {resp.score.star_detected && (
                        <div className="text-sm text-green-600 mt-2 font-bold flex items-center gap-1">
                          <span>⭐</span>
                          STAR structure detected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoInterview