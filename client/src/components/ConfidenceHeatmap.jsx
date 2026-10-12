import { useEffect, useState } from 'react'

function ConfidenceHeatmap({ text, fillerWords = [], hedgePhrases = [] }) {
  const [revealedIndices, setRevealedIndices] = useState(new Set())
  
  if (!text) return null

  // Combine all markers with their types
  const markers = [
    ...fillerWords.map(item => ({ ...item, type: 'filler' })),
    ...hedgePhrases.map(item => ({ ...item, type: 'hedge' }))
  ].sort((a, b) => a.position - b.position)

  useEffect(() => {
    if (markers.length === 0) return
    
    // Stagger reveal animation
    markers.forEach((marker, index) => {
      setTimeout(() => {
        setRevealedIndices(prev => new Set([...prev, index]))
      }, index * 40) // 40ms stagger
    })
  }, [markers.length])

  if (markers.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-sm font-medium text-green-800 mb-1">
          Confidence Analysis
        </div>
        <div className="text-green-700 text-sm">{text}</div>
        <div className="text-xs text-green-600 mt-2">
          ✓ No confidence issues detected
        </div>
      </div>
    )
  }

  // Create highlighted text with staggered reveals
  let highlightedText = ''
  let lastIndex = 0

  markers.forEach((marker, index) => {
    // Add text before this marker
    highlightedText += text.slice(lastIndex, marker.position)
    
    // Add highlighted marker with stagger
    const word = marker.word || marker.phrase
    const isRevealed = revealedIndices.has(index)
    const className = `flag-highlight ${marker.type === 'hedge' ? 'hedge' : ''}`
    const style = `animation-delay: ${index * 40}ms; ${isRevealed ? 'opacity: 1;' : ''}`
    
    highlightedText += `<span class="${className}" style="${style}">${word}</span>`
    
    lastIndex = marker.position + word.length
  })

  // Add remaining text
  highlightedText += text.slice(lastIndex)

  const fillerCount = fillerWords.length
  const hedgeCount = hedgePhrases.length

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 100 100" className="text-blue-600">
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4"/>
          <circle cx="50" cy="50" r="8" fill="currentColor"/>
        </svg>
        Confidence Analysis
      </div>
      
      <div 
        className="text-sm text-gray-700 leading-relaxed mb-3"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      <div className="flex gap-4 text-xs">
        {fillerCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-200 border border-amber-400 rounded"></div>
            <span className="text-gray-600">
              {fillerCount} filler word{fillerCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {hedgeCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
            <span className="text-gray-600">
              {hedgeCount} hedge phrase{hedgeCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {fillerCount === 0 && hedgeCount === 0 && (
          <span className="text-green-600">✓ Clear and confident delivery</span>
        )}
      </div>
    </div>
  )
}

export default ConfidenceHeatmap