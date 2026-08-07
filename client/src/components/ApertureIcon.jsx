function ApertureIcon({ size = 32, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`aperture-ring ${className}`}
    >
      <circle 
        cx="50" 
        cy="50" 
        r="35" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Aperture blades */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, i) => (
        <g key={i} transform={`rotate(${rotation} 50 50)`}>
          <path
            d="M50 15 L65 35 L50 50 L35 35 Z"
            fill="currentColor"
            opacity="0.6"
            style={{ 
              transformOrigin: '50px 50px',
              animation: `blade-open 1.2s ease-out ${i * 0.05}s forwards`
            }}
          />
        </g>
      ))}
      
      <style jsx>{`
        @keyframes blade-open {
          0% { transform: scale(0.4) rotate(0deg); opacity: 0.2; }
          100% { transform: scale(1) rotate(22.5deg); opacity: 0.6; }
        }
      `}</style>
    </svg>
  )
}

export default ApertureIcon