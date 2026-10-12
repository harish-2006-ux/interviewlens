import { useState, useEffect } from 'react'

function TypewriterSubtitle({ text, delay = 1000, speed = 100 }) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setShowCursor(true)
      let currentIndex = 0
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setTimeout(() => setShowCursor(false), 2000)
        }
      }, speed)
      
      return () => clearInterval(typeInterval)
    }, delay)
    
    return () => clearTimeout(startTimer)
  }, [text, delay, speed])
  
  return (
    <div className="text-xl text-gray-600 mb-2 h-8 flex items-center justify-center">
      <span>
        {displayText}
        {showCursor && (
          <span className="border-r-2 border-blue-500 animate-pulse ml-1"></span>
        )}
      </span>
    </div>
  )
}

export default TypewriterSubtitle