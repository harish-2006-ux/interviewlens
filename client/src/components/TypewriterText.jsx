import { useState, useEffect } from 'react'

function TypewriterText({ text, speed = 50, className = "" }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (!text) return
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed)
      
      return () => clearTimeout(timer)
    }
  }, [text, currentIndex, speed])
  
  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
  }, [text])
  
  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

export default TypewriterText