import { useState, useEffect } from 'react'

function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3b82f6',
  label = '',
  showPulse = false 
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [progress])
  
  return (
    <div className="relative inline-flex items-center justify-center">
      {showPulse && (
        <div 
          className="absolute rounded-full animate-ping opacity-30"
          style={{
            width: size + 20,
            height: size + 20,
            backgroundColor: color + '40'
          }}
        />
      )}
      
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-2xl font-bold`} style={{ color }}>
          {Math.round(animatedProgress)}%
        </div>
        {label && (
          <div className="text-xs text-gray-600 text-center max-w-16">
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressRing