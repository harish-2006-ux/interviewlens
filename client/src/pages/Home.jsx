import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TypewriterSubtitle from '../components/TypewriterSubtitle'

const features = [
  { number: '01', title: 'Practice naturally', text: 'Run text, AI, or live video interviews in one focused workspace.' },
  { number: '02', title: 'See the evidence', text: 'Get technical and communication scores with specific feedback.' },
  { number: '03', title: 'Improve over time', text: 'Track your progress across roles, sessions, and skill areas.' },
]

function Home() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', target_role: '', resume_text: '', difficulty: 'mid' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.target_role) {
      alert('Please fill in your name and target role')
      return
    }
    setLoading(true)
    try {
      const userResponse = await axios.post('/api/users', {
        name: formData.name,
        target_role: formData.target_role,
        resume_text: formData.resume_text,
      })
      const sessionResponse = await axios.post('/api/sessions/start', {
        user_id: userResponse.data._id,
        role_title: formData.target_role,
        difficulty: formData.difficulty,
      })
      navigate(`/interview/${sessionResponse.data.session_id}`, {
        state: { questions: sessionResponse.data.questions, userId: userResponse.data._id, roleTitle: formData.target_role },
      })
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start interview session')
    } finally {
      setLoading(false)
    }
  }

  const handleDashboard = async () => {
    try {
      const response = await axios.post('/api/users', {
        name: 'John Developer',
        target_role: 'Full Stack Developer',
        resume_text: 'Experienced in React, Node.js, MongoDB. Built several web applications.',
      })
      navigate(`/dashboard/${response.data._id}`)
    } catch (error) {
      alert('Please start the demo server first, then try again.')
    }
  }

  return (
    <div className="home-page">
      <div className="home-orb home-orb-one" />
      <div className="home-orb home-orb-two" />
      <main className="home-shell">
        <section className="hero-grid">
          <div className={`hero-copy ${loaded ? 'is-visible' : ''}`}>
            <div className="eyebrow"><span className="eyebrow-dot" /> AI-powered interview practice</div>
            <h1>Practice with clarity.<br /><span>Interview with confidence.</span></h1>
            <div className="hero-subtitle"><TypewriterSubtitle text="See exactly where your answer can improve." delay={250} speed={32} /></div>
            <p className="hero-description">InterviewLens turns every practice session into practical coaching, combining technical depth, communication signals, and progress you can actually track.</p>
            <div className="hero-actions">
              <button onClick={() => setShowForm(true)} className="btn-primary hero-primary">Start a practice session <span>→</span></button>
              <button onClick={() => navigate('/video-interview/demo-session/candidate', { state: { questions: [{ id: 'demo-1', text: 'Tell me about yourself and your background.', type: 'behavioral', sequence_no: 1 }, { id: 'demo-2', text: 'How would you approach solving a complex technical problem?', type: 'technical', sequence_no: 2 }, { id: 'demo-3', text: 'Describe a challenging project you worked on.', type: 'behavioral', sequence_no: 3 }], userId: 'demo-user-1', roleTitle: 'Software Engineer' } })} className="hero-text-button">Try the AI demo <span>↗</span></button>
            </div>
            <div className="hero-proof"><div className="proof-avatars"><span>JD</span><span>AK</span><span>+</span></div><div><strong>Built for deliberate practice</strong><small>Technical + communication insights</small></div></div>
          </div>

          <div className="hero-panel">
            <div className="panel-kicker">Your practice workspace <span className="status-pill"><i /> Live demo</span></div>
            <div className="score-preview"><div className="score-ring"><div><strong>82</strong><small>overall</small></div></div><div><span className="preview-label">Latest session</span><h2>Full Stack Developer</h2><p>Strong structure · Keep adding concrete examples</p><div className="mini-bars"><div><span>Technical</span><b><i style={{ width: '86%' }} /></b><em>86</em></div><div><span>Communication</span><b><i style={{ width: '78%' }} /></b><em>78</em></div></div></div></div>
            <div className="panel-divider" />
            <div className="panel-bottom"><span><b>4</b> sessions this month</span><button onClick={handleDashboard}>View dashboard <span>→</span></button></div>
          </div>
        </section>

        <section className="feature-strip">{features.map((feature) => <article className="feature-item" key={feature.number}><span>{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></article>)}</section>

        {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><div className="start-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowForm(false)}>×</button><div className="eyebrow"><span className="eyebrow-dot" /> New practice session</div><h2>Set up your interview</h2><p className="modal-copy">Tell us a little about your goal. We will build the first session around it.</p><form onSubmit={handleSubmit} className="session-form"><label>Your name<input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Priya Sharma" required /></label><label>Target role<input value={formData.target_role} onChange={(e) => setFormData({ ...formData, target_role: e.target.value })} placeholder="e.g. Frontend Developer" required /></label><div className="form-row"><label>Difficulty<select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}><option value="junior">Junior</option><option value="mid">Mid-level</option><option value="senior">Senior</option></select></label><label>Background <span className="optional">optional</span><input value={formData.resume_text} onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })} placeholder="React, APIs, databases..." /></label></div><button className="btn-primary form-submit" disabled={loading}>{loading ? 'Preparing session…' : 'Continue to interview'} <span>→</span></button></form></div></div>}

        <section className="home-footer"><span>InterviewLens</span><span>Evidence-led practice for your next opportunity.</span></section>
      </main>
    </div>
  )
}

export default Home
