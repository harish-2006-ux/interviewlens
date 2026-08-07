import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

function VideoChat({ isInterviewer = false, onConnectionChange, roomId, userInfo }) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [participants, setParticipants] = useState([])
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)
  const remoteUserIdRef = useRef(null)

  useEffect(() => {
    initializeConnection()
    
    return () => {
      cleanup()
    }
  }, [roomId])

  const initializeConnection = async () => {
    try {
      // Initialize Socket.IO
      socketRef.current = io('http://localhost:3001')
      
      // Get user media
      await initializeVideo()
      
      // Setup socket listeners
      setupSocketListeners()
      
      // Join room
      socketRef.current.emit('join-room', { 
        roomId, 
        userInfo: { 
          ...userInfo, 
          role: isInterviewer ? 'interviewer' : 'candidate' 
        } 
      })
      
      setConnectionStatus('connecting')
      
    } catch (error) {
      console.error('Error initializing connection:', error)
      setConnectionStatus('error')
    }
  }

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: true
      })
      
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Camera/microphone access required for video interviews')
      setConnectionStatus('error')
    }
  }

  const setupSocketListeners = () => {
    const socket = socketRef.current

    socket.on('room-participants', (participantList) => {
      console.log('Current participants:', participantList)
      setParticipants(participantList)
      
      if (participantList.length > 1) {
        // Find the other participant
        const otherParticipant = participantList.find(p => p.socketId !== socket.id)
        if (otherParticipant) {
          remoteUserIdRef.current = otherParticipant.socketId
          // If we're the second to join, initiate the call
          if (!isInterviewer) {
            initiateCall(otherParticipant.socketId)
          }
        }
      }
    })

    socket.on('user-joined', ({ userId, userInfo: newUserInfo, participants: updatedParticipants }) => {
      console.log('User joined:', userId, newUserInfo)
      setParticipants(updatedParticipants)
      remoteUserIdRef.current = userId
      
      // If we're the interviewer and someone joins, we initiate the call
      if (isInterviewer) {
        setTimeout(() => initiateCall(userId), 1000)
      }
    })

    socket.on('user-left', ({ userId, participants: updatedParticipants }) => {
      console.log('User left:', userId)
      setParticipants(updatedParticipants)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      onConnectionChange?.(false)
    })

    // WebRTC signaling
    socket.on('offer', async ({ offer, fromUserId }) => {
      console.log('Received offer from:', fromUserId)
      await handleReceiveOffer(offer, fromUserId)
    })

    socket.on('answer', async ({ answer, fromUserId }) => {
      console.log('Received answer from:', fromUserId)
      await handleReceiveAnswer(answer)
    })

    socket.on('ice-candidate', async ({ candidate, fromUserId }) => {
      console.log('Received ICE candidate from:', fromUserId)
      await handleReceiveIceCandidate(candidate)
    })
  }

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }

    const peerConnection = new RTCPeerConnection(configuration)

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
      setIsConnected(true)
      setConnectionStatus('connected')
      onConnectionChange?.(true)
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remoteUserIdRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          targetUserId: remoteUserIdRef.current,
          roomId
        })
      }
    }

    return peerConnection
  }

  const initiateCall = async (targetUserId) => {
    console.log('Initiating call to:', targetUserId)
    remoteUserIdRef.current = targetUserId
    
    peerConnectionRef.current = createPeerConnection()
    
    try {
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      
      socketRef.current.emit('offer', {
        offer,
        targetUserId,
        roomId
      })
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  const handleReceiveOffer = async (offer, fromUserId) => {
    remoteUserIdRef.current = fromUserId
    peerConnectionRef.current = createPeerConnection()
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      
      socketRef.current.emit('answer', {
        answer,
        targetUserId: fromUserId,
        roomId
      })
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleReceiveAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  const handleReceiveIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn
        setIsAudioOn(!isAudioOn)
      }
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  return (
    <div className="video-chat-container">
      {/* Connection Status */}
      <div className="mb-4 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
          connectionStatus === 'disconnected' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-spin' :
            connectionStatus === 'disconnected' ? 'bg-gray-500' :
            'bg-red-500'
          }`}></div>
          {connectionStatus === 'connected' && `🎥 Connected • ${participants.length} participants`}
          {connectionStatus === 'connecting' && '⏳ Connecting...'}
          {connectionStatus === 'disconnected' && '📞 Disconnected'}
          {connectionStatus === 'error' && '❌ Connection Error'}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote Video */}
        <div className="relative">
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <p className="text-sm">
                    {participants.length < 2 ? 'Waiting for connection...' : 'Establishing video...'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {isInterviewer ? 'Candidate' : 'Interviewer'}
          </div>
        </div>

        {/* Local Video */}
        <div className="relative">
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <p className="text-sm">Camera Off</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            You ({isInterviewer ? 'Interviewer' : 'Candidate'})
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all duration-200 ${
            isVideoOn 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? '📹' : '📷'}
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all duration-200 ${
            isAudioOn 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>

        <button
          onClick={cleanup}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
          title="End call"
        >
          📞
        </button>
      </div>

      {/* Room Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <div>Room: <span className="font-mono font-bold">{roomId}</span></div>
        <div className="flex justify-center items-center gap-4 mt-2">
          <span>Share this room ID with your partner to connect</span>
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs"
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoChat