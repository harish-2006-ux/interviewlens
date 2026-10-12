import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import VoiceInput from '../components/VoiceInput'
import ConfidenceHeatmap from '../components/ConfidenceHeatmap'
import MatrixRain from '../components/MatrixRain'
import ProgressRing from '../components/ProgressRing'

function Interview() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [questions, setQuestions] = useState(location.state?.questions || [])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(null)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex >= questions.length - 1

  useEffect(() => {
    setStartTime(Date.now())
  }, [currentQuestionIndex])

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before proceeding')
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

      // Store response data
      const newResponse = {
        question: currentQuestion,
        answer,
        score: response.data.score,
        responseTime: responseTimeSeconds
      }
      setResponses(prev => [...prev, newResponse])

      // Check for follow-up question
      if (response.data.follow_up_question) {
        setQuestions(prev => {
          const newQuestions = [...prev]
          newQuestions.splice(currentQuestionIndex + 1, 0, response.data.follow_up_question)
          return newQuestions
        })
      }

      // Move to next question or finish
      if (isLastQuestion) {
        finishInterview()
      } else {
        setCurrentQuestionIndex(prev => prev + 1)
        setAnswer('')
        setStartTime(Date.now())
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setLoading(false)
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

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <p>Loading interview questions...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <MatrixRain opacity={0.03} speed={0.5} />
      
      <div className="relative z-10">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Interview Session
          </h1>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out transform"
            style={{ 
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                currentQuestion.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                currentQuestion.type === 'behavioral' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {currentQuestion.type}
              </span>
              {currentQuestion.is_followup && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  Follow-up
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Type your answer here or use the voice input below..."
                />
              </div>

              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                onRecordingChange={setIsRecording}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setAnswer('')}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Clear Answer
                </button>
                
                <button
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 
                   isLastQuestion ? 'Finish Interview' : 'Next Question'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Interview Tips
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Use specific examples from your experience</li>
              <li>• Follow the STAR method for behavioral questions</li>
              <li>• Think out loud for technical problems</li>
              <li>• Ask clarifying questions when needed</li>
              <li>• Take your time to provide thoughtful answers</li>
            </ul>
          </div>

          {responses.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Recent Scores
              </h3>
              <div className="space-y-3">
                {responses.slice(-2).map((resp, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-3">
                    <div className="text-sm font-medium text-gray-900">
                      Q{responses.length - 1 - index}: {resp.question.type}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      {resp.score.technical_score && (
                        <span>Tech: {resp.score.technical_score}/100</span>
                      )}
                      <span>Comm: {resp.score.communication_score}/100</span>
                    </div>
                    {resp.score.star_detected && (
                      <div className="text-xs text-green-600">✓ STAR structure detected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show confidence heatmap for previous answers */}
      {responses.length > 0 && (
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Previous Answers Analysis
          </h3>
          <div className="space-y-4">
            {responses.slice(-2).map((resp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {resp.question.text}
                </div>
                <ConfidenceHeatmap 
                  text={resp.answer}
                  fillerWords={resp.score.filler_words_found}
                  hedgePhrases={resp.score.hedge_phrases_found}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Interview