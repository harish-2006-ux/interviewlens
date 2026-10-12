import { useState, useRef, useEffect } from 'react'
import VoiceWaveform from './VoiceWaveform'

function VoiceInput({ onTranscript, onRecordingChange }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [amplitude, setAmplitude] = useState(0)
  const recognitionRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript || interimTranscript) {
          onTranscript(finalTranscript + interimTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        onRecordingChange(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        onRecordingChange(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [onTranscript, onRecordingChange])

  const startRecording = async () => {
    if (recognitionRef.current && !isRecording) {
      try {
        // Start audio analysis for waveform
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
          const source = audioContextRef.current.createMediaStreamSource(stream)
          const analyser = audioContextRef.current.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          
          const updateAmplitude = () => {
            if (isRecording) {
              analyser.getByteFrequencyData(dataArray)
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length
              setAmplitude(average / 255)
              requestAnimationFrame(updateAmplitude)
            }
          }
          updateAmplitude()
        } catch (audioError) {
          console.warn('Audio analysis not available:', audioError)
        }
        
        recognitionRef.current.start()
        setIsRecording(true)
        onRecordingChange(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      onRecordingChange(false)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-700">
          Voice input is not supported in your browser. Please type your answer above.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <VoiceWaveform isRecording={isRecording} amplitude={amplitude} />
      </div>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
          isRecording 
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
        }`}
      >
        {isRecording ? (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              Stop Recording
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xl">🎤</span>
            Start Voice Analysis
          </div>
        )}
      </button>
      
      {isRecording ? (
        <p className="text-sm text-gray-600 animate-pulse">
          🎵 Analyzing your speech patterns...
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Click to start voice input with real-time analysis
        </p>
      )}
    </div>
  )
}

export default VoiceInput