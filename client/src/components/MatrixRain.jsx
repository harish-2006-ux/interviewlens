import { useEffect, useRef } from 'react'

function MatrixRain({ opacity = 0.1, speed = 1 }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:,.<>?'
    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops = Array(Math.floor(columns)).fill(1)
    
    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 / speed})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
      ctx.font = `${fontSize}px monospace`
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length))
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speed
      }
    }
    
    const interval = setInterval(draw, 50)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [opacity, speed])
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
    />
  )
}

export default MatrixRain