import { useEffect, useState } from 'react'

function FloatingParticles() {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1
    }))
    setParticles(newParticles)
  }, [])
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-blue-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${particle.speed * 10}s ease-in-out infinite alternate`
          }}
        />
      ))}
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default FloatingParticles