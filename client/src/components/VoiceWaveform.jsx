import { useState, useEffect } from 'react'

function VoiceWaveform({ isRecording, amplitude = 0.5 }) {
  const [bars, setBars] = useState(Array(12).fill(0))
  
  useEffect(() => {
    if (!isRecording) {
      setBars(Array(12).fill(0))
      return
    }
    
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * amplitude + 0.1))
    }, 100)
    
    return () => clearInterval(interval)
  }, [isRecording, amplitude])
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full transition-all duration-100 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${Math.max(height * 24, 2)}px`,
            animationDelay: `${i * 50}ms`
          }}
        />
      ))}
    </div>
  )
}

export default VoiceWaveform