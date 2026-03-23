import { useState, useEffect } from 'react'
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

function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
}

function isStandalone(): boolean {
  return ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
}

export default function Onboard() {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [saving, setSaving] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [pushGranted, setPushGranted] = useState(false)
  const [error, setError] = useState('')
  const [pushDenied, setPushDenied] = useState(false)

  useEffect(() => {
    if (isIOSSafari() && !isStandalone()) {
      setShowIOSPrompt(true)
    }
  }, [])

  const updateTime = (slot: number, time: string) => {
    setSchedule(prev => prev.map(s => s.slot === slot ? { ...s, time } : s))
  }

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
      interrupt_schedule: schedule,
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
      <SectionMarker label="1" />

      <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: 'var(--space-paragraph)' }}>
        <Link to="/history" className="nav-link">&sect; history</Link>
      </div>

      <p className="drop-cap" style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        lineHeight: 1.65,
        marginBottom: 'var(--space-paragraph)',
      }}>
        Set the six moments each day when we will interrupt your autopilot. These
        are not reminders. They are fractures in the routine that protects you from
        seeing clearly. Choose times when you are most likely to be operating on
        automatic — the hours when habit governs and attention sleeps.
      </p>

      <p className="mono-meta" style={{ marginBottom: 'var(--space-section)' }}>
        timezone detected: {timezone}
      </p>

      <Divider variant="dashed" />

      <div style={{ marginBottom: 'var(--space-paragraph)' }}>
        {schedule.map(({ slot, time }) => (
          <div key={slot} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderBottom: slot < 6 ? '1px solid var(--parchment-dark)' : 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--ink)',
            }}>
              &sect;{slot}
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => updateTime(slot, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Divider variant="medium" />

      {showIOSPrompt && !isStandalone() ? (
        <div style={{ marginBottom: 'var(--space-section)' }}>
          <p style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            marginBottom: 'var(--space-paragraph)',
          }}>
            To receive the interrupts, install Awaken on your Home Screen:
          </p>
          <ol style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-light)',
            paddingLeft: '1.5em',
            lineHeight: 2.2,
            fontWeight: 600,
          }}>
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Open Awaken from your Home Screen</li>
          </ol>
        </div>
      ) : (
        !pushGranted && (MOCK_MODE || isNotificationSupported()) && (
          <div style={{ marginBottom: 'var(--space-section)', textAlign: 'center' }}>
            <button onClick={requestPush}>
              Enable Notifications
            </button>
            <p className="mono-meta" style={{ marginTop: 'var(--space-line)' }}>
              {MOCK_MODE ? 'mock mode — simulated' : 'required for daily interrupts'}
            </p>
          </div>
        )
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
