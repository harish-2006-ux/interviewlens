import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import ConfidenceHeatmap from '../components/ConfidenceHeatmap'
import AnimatedScore from '../components/AnimatedScore'
import TypewriterText from '../components/TypewriterText'
import ScoreBubbles from '../components/ScoreBubbles'
import ProgressRing from '../components/ProgressRing'
import FloatingParticles from '../components/FloatingParticles'

function SessionReport() {
  const { sessionId } = useParams()
  const location = useLocation()
  const { summary, responses, userId } = location.state || {}
  const [celebrationTrigger, setCelebrationTrigger] = useState(0)

  useEffect(() => {
    if (summary) {
      // Trigger score celebration after page loads
      setTimeout(() => setCelebrationTrigger(1), 1000)
    }
  }, [summary])

  if (!summary) {
    return (
      <div className="min-h-screen lens-spotlight flex items-center justify-center relative">
        <FloatingParticles />
        <div className="card-glass text-center animate-pulse">
          <div className="aperture-dramatic mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-white">Loading session report...</p>
        </div>
      </div>
    )
  }

  const { session_summary, detailed_scores } = summary

  return (
    <div className="min-h-screen lens-spotlight relative overflow-hidden">
      <FloatingParticles />
      <div className="scan-lines"></div>
      
      <ScoreBubbles 
        scores={summary ? [
          { value: summary.session_summary.overall_score, label: 'Overall', color: 'blue' },
          { value: summary.session_summary.avg_technical || 0, label: 'Technical', color: 'green' },
          { value: summary.session_summary.avg_communication, label: 'Communication', color: 'purple' }
        ] : []}
        trigger={celebrationTrigger}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative lens-content">
        {/* Dramatic Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="aperture-dramatic"></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Analysis Complete
            </h1>
            <div className="aperture-dramatic"></div>
          </div>
          <div className="text-xl text-white/90 font-medium">
            <TypewriterText 
              text="Your comprehensive performance breakdown is ready"
              speed={30}
            />
          </div>
        </div>

        {/* Enhanced Overall Score Summary */}
        <div className="card mb-12 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Overall Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <ProgressRing 
                progress={session_summary.overall_score} 
                size={120} 
                color="#4facfe"
                label="Overall"
                showPulse={session_summary.overall_score > 80}
              />
              <div className="mt-4">
                <AnimatedScore 
                  finalScore={session_summary.overall_score} 
                  label="Overall Score" 
                  color="blue"
                />
              </div>
            </div>
            
            {session_summary.avg_technical && (
              <div className="text-center">
                <ProgressRing 
                  progress={session_summary.avg_technical} 
                  size={120} 
                  color="#43e97b"
                  label="Technical"
                />
                <div className="mt-4">
                  <AnimatedScore 
                    finalScore={session_summary.avg_technical} 
                    label="Technical Depth" 
                    color="green"
                  />
                </div>
              </div>
            )}
            
            <div className="text-center">
              <ProgressRing 
                progress={session_summary.avg_communication} 
                size={120} 
                color="#f093fb"
                label="Communication"
              />
              <div className="mt-4">
                <AnimatedScore 
                  finalScore={session_summary.avg_communication} 
                  label="Communication" 
                  color="purple"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <span className="text-3xl">💪</span>
                Strengths
              </h3>
              <ul className="space-y-3">
                {session_summary.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 animate-fadeInUp" 
                      style={{animationDelay: `${0.6 + index * 0.1}s`, animationFillMode: 'forwards', opacity: 0}}>
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <span className="text-green-800 font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
              <h3 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                Growth Areas
              </h3>
              <ul className="space-y-3">
                {session_summary.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 animate-fadeInUp" 
                      style={{animationDelay: `${0.8 + index * 0.1}s`, animationFillMode: 'forwards', opacity: 0}}>
                    <span className="text-orange-500 text-xl mt-1">→</span>
                    <span className="text-orange-800 font-medium">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Detailed Question Analysis */}
        <div className="card mb-12 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🔍</span>
            Question-by-Question Analysis
          </h2>
          
          <div className="space-y-8">
            {detailed_scores.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-102 animate-fadeInUp" 
                   style={{animationDelay: `${0.9 + index * 0.2}s`, animationFillMode: 'forwards', opacity: 0}}>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-4 py-2 text-sm font-bold rounded-2xl ${
                    item.type === 'technical' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    item.type === 'behavioral' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-gray-600">Question {index + 1}</span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    {item.question}
                  </h3>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    Your Answer:
                  </h4>
                  {responses && responses[index] ? (
                    <ConfidenceHeatmap 
                      text={item.answer}
                      fillerWords={responses[index].score.filler_words_found}
                      hedgePhrases={responses[index].score.hedge_phrases_found}
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4">
                      <div className="text-gray-800 font-medium">{item.answer}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {item.technical_score && (
                    <div className="text-center bg-blue-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {item.technical_score}
                      </div>
                      <div className="text-sm font-bold text-blue-800">TECHNICAL</div>
                    </div>
                  )}
                  
                  <div className="text-center bg-purple-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {item.communication_score}
                    </div>
                    <div className="text-sm font-bold text-purple-800">COMMUNICATION</div>
                  </div>

                  {responses && responses[index] && (
                    <>
                      <div className="text-center bg-orange-50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-orange-600">
                          {Math.round(responses[index].score.filler_word_ratio * 100)}%
                        </div>
                        <div className="text-sm font-bold text-orange-800">FILLER RATE</div>
                      </div>
                      
                      <div className="text-center bg-green-50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-600">
                          {responses[index].score.star_detected ? '✓' : '✗'}
                        </div>
                        <div className="text-sm font-bold text-green-800">STAR METHOD</div>
                      </div>
                    </>
                  )}
                </div>

                {item.feedback && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">💡</span>
                      <div className="text-lg font-bold text-blue-900">AI Feedback:</div>
                    </div>
                    <div className="text-blue-800 font-medium leading-relaxed">{item.feedback}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex flex-wrap gap-6 justify-center animate-fadeInUp" style={{animationDelay: '1.2s'}}>
          <Link
            to="/"
            className="btn-primary group relative overflow-hidden"
          >
            <span className="flex items-center justify-center gap-3 text-xl">
              <span className="text-2xl">🎯</span>
              Start New Interview
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Link>
          
          {userId && (
            <Link
              to={`/dashboard/${userId}`}
              className="btn-warning group relative overflow-hidden"
            >
              <span className="flex items-center justify-center gap-3 text-xl">
                <span className="text-2xl">📊</span>
                View Progress Dashboard
              </span>
            </Link>
          )}
        </div>

        {/* Achievement Badge */}
        {session_summary.overall_score > 80 && (
          <div className="mt-8 text-center animate-bounceIn">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-bold py-4 px-8 rounded-3xl shadow-2xl">
              <span className="text-3xl animate-spin">🏆</span>
              <span className="text-xl">Outstanding Performance!</span>
              <span className="text-3xl animate-bounce">⭐</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionReport