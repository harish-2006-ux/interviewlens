import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const questions = [
  { id: 'q1', text: 'Tell me about yourself and your background.', type: 'behavioral', sequence_no: 1 },
  { id: 'q2', text: 'How would you approach solving a complex technical problem?', type: 'technical', sequence_no: 2 },
  { id: 'q3', text: 'Describe a challenging project you worked on.', type: 'behavioral', sequence_no: 3 },
  { id: 'q4', text: 'What are your strengths and areas for improvement?', type: 'behavioral', sequence_no: 4 },
  { id: 'q5', text: 'How do you handle working under pressure and tight deadlines?', type: 'behavioral', sequence_no: 5 },
  { id: 'q6', text: 'Explain a technical concept you recently learned.', type: 'technical', sequence_no: 6 },
  { id: 'q7', text: 'Why are you interested in this role and our company?', type: 'fit', sequence_no: 7 },
]

const roles = {
  candidate: {
    label: 'Candidate',
    eyebrow: 'Respond + reflect',
    description: 'Take the spotlight and answer with clarity.',
    accent: 'from-cyan-400 to-blue-500',
    icon: 'C',
  },
  interviewer: {
    label: 'Interviewer',
    eyebrow: 'Guide + observe',
    description: 'Set the pace and lead the conversation.',
    accent: 'from-violet-400 to-fuchsia-500',
    icon: 'I',
  },
}

function JoinRoom() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', roomId: '', role: 'candidate' })
  const [copied, setCopied] = useState(false)
  const selectedRole = roles[formData.role]
  const isReady = Boolean(formData.name.trim() && formData.roomId.trim())

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData(prev => ({ ...prev, roomId: id }))
    setCopied(false)
  }

  const copyRoomId = async () => {
    if (!formData.roomId) return
    try {
      await navigator.clipboard.writeText(formData.roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const joinRoom = () => {
    if (!isReady) return
    navigate(`/video-interview/${formData.roomId.toUpperCase()}/${formData.role}`, {
      state: {
        questions,
        userId: 'user-' + Date.now(),
        roleTitle: 'Software Engineer',
        userName: formData.name.trim(),
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#090d1d] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 12% 15%, rgba(34,211,238,.18), transparent 28%), radial-gradient(circle at 90% 80%, rgba(168,85,247,.2), transparent 32%)' }} />
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <main className="relative z-10 max-w-6xl mx-auto px-5 py-10 md:py-16">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate('/')} className="text-white/55 hover:text-white transition-colors text-sm tracking-wide">
            <span className="mr-2">←</span> Back to workspace
          </button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/45">
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
            Secure room protocol
          </div>
        </div>

        <section className="grid lg:grid-cols-[.86fr_1.14fr] gap-8 items-stretch">
          <div className="flex flex-col justify-between min-h-[620px] py-5 lg:pr-10">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 text-[11px] uppercase tracking-[0.22em]">
                <span className="font-mono">01</span>
                Open a live channel
              </div>
              <h1 className="mt-7 text-5xl md:text-7xl font-black leading-[.94] tracking-[-.06em]">
                Enter the
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400">signal room.</span>
              </h1>
              <p className="mt-7 max-w-md text-white/55 text-base leading-7">
                A focused space for real conversations. Pick your perspective, create a room key, and bring one other person into the frame.
              </p>
            </div>

            <div className="mt-12 space-y-5">
              {[
                ['01', 'Choose your lens', 'Candidate or interviewer'],
                ['02', 'Match the room key', 'Both people use the same code'],
                ['03', 'Start the conversation', 'Camera, audio, and chat connect'],
              ].map(([number, title, detail], index) => (
                <div key={number} className="flex gap-4 items-start">
                  <span className={`mt-1 w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center font-mono text-xs ${index === 0 ? 'border-cyan-300/50 text-cyan-200 bg-cyan-300/10' : 'border-white/10 text-white/35'}`}>{number}</span>
                  <div>
                    <p className="font-semibold text-white/85">{title}</p>
                    <p className="text-sm text-white/40 mt-1">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="px-6 md:px-9 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-cyan-200">◎</span>
                <div>
                  <p className="text-xs uppercase tracking-[.2em] text-white/35">Room setup</p>
                  <p className="text-sm font-semibold text-white/80">InterviewLens / live</p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-300"><i className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Ready</span>
            </div>

            <div className="p-6 md:p-9 space-y-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[.2em] text-white/40 mb-3">Your name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/25 outline-none focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 transition-all"
                  placeholder="How should we identify you?"
                  autoComplete="name"
                />
              </div>

              <div>
                <div className="flex items-end justify-between mb-3">
                  <label className="block text-[11px] uppercase tracking-[.2em] text-white/40">Choose your perspective</label>
                  <span className="text-xs text-white/30">You can switch before joining</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(roles).map(([key, role]) => {
                    const active = formData.role === key
                    return (
                      <button key={key} type="button" onClick={() => setFormData(prev => ({ ...prev, role: key }))} className={`text-left p-4 rounded-2xl border transition-all ${active ? 'border-white/35 bg-white/12 shadow-lg shadow-cyan-950/20' : 'border-white/10 bg-black/10 hover:bg-white/[0.08]'}`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.accent} flex items-center justify-center text-sm font-black text-white shadow-lg mb-4`}>{role.icon}</div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-white/90">{role.label}</p>
                          {active && <span className="text-cyan-200 text-xs">Selected</span>}
                        </div>
                        <p className="text-[10px] uppercase tracking-[.16em] text-white/35 mt-1">{role.eyebrow}</p>
                        <p className="text-sm text-white/50 mt-3 leading-5">{role.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between mb-3">
                  <label className="block text-[11px] uppercase tracking-[.2em] text-white/40">Room key</label>
                  <span className="text-xs text-white/30">6 characters</span>
                </div>
                <div className="flex gap-3">
                  <input
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }))}
                    className="min-w-0 flex-1 bg-black/25 border border-white/10 rounded-2xl px-5 py-4 text-cyan-200 font-mono text-xl tracking-[.35em] placeholder:text-white/20 placeholder:tracking-normal outline-none focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 transition-all"
                    placeholder="ENTER KEY"
                    maxLength={6}
                  />
                  <button type="button" onClick={generateRoomId} className="px-5 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white/75 transition-colors" title="Generate a room key">New</button>
                </div>
                {formData.roomId && (
                  <button type="button" onClick={copyRoomId} className="mt-3 text-xs text-cyan-200/75 hover:text-cyan-100 transition-colors">{copied ? 'Room key copied' : 'Copy room key to share →'}</button>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-300 flex items-center justify-center">✓</span>
                <div className="flex-1"><p className="text-sm text-white/75">Camera + microphone ready</p><p className="text-xs text-white/35 mt-0.5">Your browser will ask for permission inside the room.</p></div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-300/80">WebRTC</span>
              </div>

              <button type="button" onClick={joinRoom} disabled={!isReady} className={`w-full rounded-2xl py-4 font-bold flex items-center justify-center gap-3 transition-all ${isReady ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-white shadow-xl shadow-blue-950/40 hover:-translate-y-0.5' : 'bg-white/10 text-white/25 cursor-not-allowed'}`}>
                Enter as {selectedRole.label}
                <span className="text-xl">↗</span>
              </button>
              <p className="text-center text-[11px] text-white/30">Share the same room key with your interview partner.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default JoinRoom
