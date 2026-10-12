import { useState, useEffect } from 'react'

function AnimatedScore({ finalScore, label, color = "blue" }) {
  const [currentScore, setCurrentScore] = useState(0)
  
  useEffect(() => {
    if (finalScore === 0) return
    
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = finalScore / steps
    let step = 0
    
    const timer = setInterval(() => {
      step++
      if (step <= steps) {
        setCurrentScore(Math.round(increment * step))
      } else {
        setCurrentScore(finalScore)
        clearInterval(timer)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [finalScore])
  
  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'text-green-600'
      case 'purple': return 'text-purple-600'
      case 'orange': return 'text-orange-600'
      default: return 'text-blue-600'
    }
  }
  
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${getColorClasses()} mb-2 transition-all duration-200`}>
        {currentScore}
        <span className="text-2xl">/100</span>
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

export default AnimatedScore