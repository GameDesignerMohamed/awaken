import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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

  useEffect(() => {
    if (isIOSSafari() && !isStandalone()) {
      setShowIOSPrompt(true)
    }
  }, [])

  const updateTime = (slot: number, time: string) => {
    setSchedule(prev => prev.map(s => s.slot === slot ? { ...s, time } : s))
  }

  const requestPush = async () => {
    const subscription = await subscribeToPush()
    if (subscription) {
      setPushGranted(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          push_subscription: subscription.toJSON(),
        }).eq('id', user.id)
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').upsert({
      id: user.id,
      timezone,
      interrupt_schedule: schedule,
    })

    setSaving(false)
    navigate('/history', { replace: true })
  }

  return (
    <div className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="Onboard" />

      <h2 style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xl)',
        marginBottom: 'var(--space-line)',
      }}>
        Set Your Interrupts
      </h2>

      <p style={{
        color: 'var(--ink-light)',
        fontSize: 'var(--text-sm)',
        marginBottom: 'var(--space-section)',
      }}>
        Timezone: {timezone}
      </p>

      <div style={{ marginBottom: 'var(--space-section)' }}>
        {schedule.map(({ slot, time }) => (
          <div key={slot} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-paragraph)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-light)',
            }}>
              &sect;{slot}
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => updateTime(slot, e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
            />
          </div>
        ))}
      </div>

      <Divider variant="medium" />

      {showIOSPrompt && !isStandalone() ? (
        <div style={{ marginBottom: 'var(--space-section)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-paragraph)' }}>
            To receive notifications, add Awaken to your Home Screen:
          </p>
          <ol style={{
            textAlign: 'left',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-light)',
            paddingLeft: '1.5em',
            lineHeight: 2,
          }}>
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Open Awaken from your Home Screen</li>
          </ol>
        </div>
      ) : (
        !pushGranted && isNotificationSupported() && (
          <div style={{ marginBottom: 'var(--space-section)', textAlign: 'center' }}>
            <button onClick={requestPush} style={{ marginBottom: 'var(--space-line)' }}>
              Enable Notifications
            </button>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
              Required for daily interrupts
            </p>
          </div>
        )
      )}

      {pushGranted && (
        <p style={{
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-light)',
          marginBottom: 'var(--space-section)',
        }}>
          Notifications enabled.
        </p>
      )}

      <button onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving...' : 'Begin'}
      </button>
    </div>
  )
}
