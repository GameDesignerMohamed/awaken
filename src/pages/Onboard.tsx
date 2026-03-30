import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, MOCK_MODE } from '../lib/supabase'
import { subscribeToPush, isNotificationSupported } from '../lib/push'
import SectionMarker from '../components/SectionMarker'
import Divider from '../components/Divider'

const DEFAULT_SCHEDULE = [
  { slot: 1, time: '11:00' },
  { slot: 2, time: '13:30' },
  { slot: 3, time: '15:15' },
  { slot: 4, time: '17:00' },
  { slot: 5, time: '19:30' },
  { slot: 6, time: '21:00' },
]

const ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
}

const DISPLAY_TIMES: Record<number, string> = {
  1: '11:00 AM',
  2: '1:30 PM',
  3: '3:15 PM',
  4: '5:00 PM',
  5: '7:30 PM',
  6: '9:00 PM',
}

export default function Onboard() {
  const navigate = useNavigate()
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [saving, setSaving] = useState(false)
  const [pushGranted, setPushGranted] = useState(false)
  const [error, setError] = useState('')
  const [pushDenied, setPushDenied] = useState(false)


  const requestPush = async () => {
    if (MOCK_MODE) {
      setPushGranted(true)
      return
    }
    const subscription = await subscribeToPush()
    if (subscription) {
      setPushGranted(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          push_subscription: subscription.toJSON(),
        }).eq('id', user.id)
      }
    } else {
      setPushDenied(true)
      return
    }
  }

  const handleSave = async () => {
    setSaving(true)

    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 300))
      setSaving(false)
      navigate('/history', { replace: true })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      timezone,
      interrupt_schedule: DEFAULT_SCHEDULE,
    })

    if (upsertError) {
      setError('Unable to save. Check your connection and try again.')
      setSaving(false)
      return
    }

    setSaving(false)
    navigate('/history', { replace: true })
  }

  return (
    <main className="page" aria-label="Set interrupt schedule" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="I." />

      <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: 'var(--space-paragraph)' }}>
        <Link to="/history" className="nav-link">history</Link>
      </div>

      <p className="drop-cap" style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        lineHeight: 1.65,
        marginBottom: 'var(--space-paragraph)',
      }}>
        Six times a day, you'll receive a notification with a question.
        Not advice. Not affirmations. A question that makes you stop and
        notice what you're actually doing — and whether it's what you want.
      </p>

      <p className="mono-meta" style={{ marginBottom: 'var(--space-line)' }}>
        timezone detected: {timezone}
      </p>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        marginBottom: 'var(--space-line)',
      }}>
        Your interrupts are set to:
      </p>

      <div style={{ marginBottom: 'var(--space-section)' }}>
        {DEFAULT_SCHEDULE.map(({ slot }) => (
          <div key={slot} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: slot < 6 ? '1px solid var(--parchment-dark)' : 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--ink)',
            }}>
              {ROMAN[slot]}.
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-base)',
              color: 'var(--ink-light)',
            }}>
              {DISPLAY_TIMES[slot]}
            </span>
          </div>
        ))}
      </div>

      <Divider variant="medium" />

      {!pushGranted && !pushDenied && (MOCK_MODE || isNotificationSupported()) && (
        <div style={{ marginBottom: 'var(--space-section)', textAlign: 'center' }}>
          <button onClick={requestPush}>
            Enable Notifications
          </button>
          <p className="mono-meta" style={{ marginTop: 'var(--space-line)' }}>
            {MOCK_MODE ? 'mock mode — simulated' : 'required for daily interrupts'}
          </p>
        </div>
      )}

      {pushGranted && (
        <p className="mono-meta" style={{
          textAlign: 'center',
          marginBottom: 'var(--space-section)',
        }}>
          notifications enabled.
        </p>
      )}

      {pushDenied && (
        <p className="mono-meta" style={{
          textAlign: 'center',
          marginBottom: 'var(--space-section)',
        }}>
          notifications blocked. you can enable them later in browser settings.
        </p>
      )}

      <button onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving...' : 'Begin'}
      </button>

      {error && (
        <p className="error-text" style={{ marginTop: 'var(--space-line)' }}>
          {error}
        </p>
      )}

      <Divider variant="footer" />
    </main>
  )
}
