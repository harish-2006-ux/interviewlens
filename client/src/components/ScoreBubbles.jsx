import { useState, useEffect } from 'react'

function ScoreBubbles({ scores = [], trigger = 0 }) {
  const [bubbles, setBubbles] = useState([])
  
  useEffect(() => {
    if (trigger > 0 && scores.length > 0) {
      const newBubbles = scores.map((score, i) => ({
        id: Date.now() + i,
        score: score.value,
        label: score.label,
        x: Math.random() * 80 + 10,
        y: 100,
        color: score.color || 'blue',
        delay: i * 200
      }))
      
      setBubbles(newBubbles)
      
      // Remove bubbles after animation
      setTimeout(() => setBubbles([]), 3000)
    }
  }, [trigger, scores])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className={`absolute transition-all duration-3000 ease-out`}
          style={{
            left: `${bubble.x}%`,
            bottom: `${bubble.y}%`,
            animationDelay: `${bubble.delay}ms`,
            animation: `float-up 3s ease-out ${bubble.delay}ms forwards`
          }}
        >
          <div className={`
            bg-gradient-to-r from-${bubble.color}-400 to-${bubble.color}-600 
            text-white px-4 py-2 rounded-full shadow-lg font-bold
            transform hover:scale-110 transition-transform
          `}>
            <div className="text-lg">{bubble.score}</div>
            <div className="text-xs opacity-90">{bubble.label}</div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(-50px) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateY(-200px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-300px) scale(0.8);
          }
        }
      `}</style>
    </div>
  )
}

export default ScoreBubbles