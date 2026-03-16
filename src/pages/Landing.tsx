import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Divider from '../components/Divider'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Divider variant="elaborate" />

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        letterSpacing: '0.3em',
        marginBottom: 'var(--space-paragraph)',
      }}>
        A W A K E N
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        color: 'var(--ink-light)',
        marginBottom: 'var(--space-section)',
        maxWidth: '320px',
        lineHeight: 1.7,
      }}>
        You are just today's face<br />of The Change.
      </p>

      <Divider variant="elaborate" />

      {sent ? (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          marginTop: 'var(--space-section)',
          maxWidth: '320px',
        }}>
          Check your email for a magic link to sign in.
          <br /><br />
          <span style={{ color: 'var(--ink-faint)', fontSize: 'var(--text-sm)' }}>
            If you don't see it, check your spam folder.
          </span>
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-section)', width: '100%', maxWidth: '320px' }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-light)',
            marginBottom: 'var(--space-line)',
          }}>
            Enter your email to begin.
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            style={{ width: '100%', marginBottom: 'var(--space-paragraph)' }}
          />

          {error && (
            <p style={{ color: 'var(--ember)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-paragraph)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 'var(--space-section)' }}>
        <Divider variant="elaborate" />
      </div>
    </div>
  )
}
