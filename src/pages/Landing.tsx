import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, MOCK_MODE } from '../lib/supabase'
import SectionMarker from '../components/SectionMarker'
import Divider from '../components/Divider'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 500))
      setLoading(false)
      navigate('/onboard')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="page" aria-label="Sign in with magic link" style={{ maxWidth: '460px', margin: '0 auto' }}>
      <SectionMarker label="0" pageNum={1} />

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-paragraph)' }}>
        <Divider variant="medium" />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        letterSpacing: '0.35em',
        textAlign: 'center',
        marginBottom: 'var(--space-line)',
        color: 'var(--ink)',
      }}>
        AWAKEN
      </h1>

      <Divider variant="simple" />

      <p className="drop-cap" style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        color: 'var(--ink)',
        marginBottom: 'var(--space-paragraph)',
        lineHeight: 1.65,
      }}>
        Six times a day, Awaken sends you a question designed to break
        your autopilot. Not affirmations. Not tips. Hard questions that
        force you to notice what you're actually doing with your life —
        right now, in this moment.
      </p>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--ink-faint)',
        marginBottom: 'var(--space-paragraph)',
        lineHeight: 1.7,
      }}>
        You choose the times. We send the interrupts. You answer honestly.
        After seven days, an AI coach analyzes your patterns and shows you
        what you can't see yourself.
      </p>

      <Divider variant="dashed" />

      {sent ? (
        <div style={{ marginTop: 'var(--space-paragraph)' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
          }}>
            Check your email for a magic link to sign in.
          </p>
          <p style={{
            color: 'var(--ink-faint)',
            fontSize: 'var(--text-xs)',
            marginTop: 'var(--space-paragraph)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.06em',
          }}>
            if you don't see it, check your spam folder.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 'var(--space-paragraph)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--ink-faint)',
            marginBottom: 'var(--space-paragraph)',
            letterSpacing: '0.06em',
          }}>
            enter your email to begin.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              style={{ width: '100%', marginBottom: 'var(--space-paragraph)' }}
            />

            {MOCK_MODE && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-faint)',
                marginBottom: 'var(--space-paragraph)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}>
                mock mode — any email works
              </p>
            )}

            {error && (
              <div style={{ marginBottom: 'var(--space-paragraph)' }}>
                <p className="error-text">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => { setError(''); }}
                  style={{
                    background: 'transparent',
                    color: 'var(--ink-faint)',
                    border: 'none',
                    padding: '4px 0',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    marginTop: 'var(--space-line)',
                  }}
                >
                  try again
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        </div>
      )}

      <Divider variant="footer" />
    </main>
  )
}
