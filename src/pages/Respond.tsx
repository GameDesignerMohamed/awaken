import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase, MOCK_MODE } from '../lib/supabase'
import SectionMarker from '../components/SectionMarker'
import PromptCard from '../components/PromptCard'
import Divider from '../components/Divider'

const PROMPTS: Record<number, string> = {
  1: 'What am I avoiding by doing what I\'m doing?',
  2: 'If someone filmed the last two hours, what would they conclude I want?',
  3: 'Am I moving toward the life I hate or the life I want?',
  4: 'What\'s the most important thing I\'m pretending isn\'t important?',
  5: 'What did I do today from identity protection rather than genuine desire?',
  6: 'When did I feel most alive today? Most dead?',
}

const ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
}

const SLOT_TIMES: Record<number, string> = {
  1: '11:00 AM',
  2: '1:30 PM',
  3: '3:15 PM',
  4: '5:00 PM',
  5: '7:30 PM',
  6: '9:00 PM',
}

export default function Respond() {
  const [searchParams] = useSearchParams()
  const slotParam = searchParams.get('slot')
  const slot = slotParam ? parseInt(slotParam, 10) : NaN
  const prompt = PROMPTS[slot]

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  const storageKey = `awaken-draft-${slot}`

  const [draft, setDraft] = useState(() => {
    if (!prompt) return ''
    return localStorage.getItem(storageKey) || ''
  })

  useEffect(() => {
    if (draft && prompt) {
      localStorage.setItem(storageKey, draft)
    }
  }, [draft, storageKey, prompt])

  useEffect(() => {
    const t = setTimeout(() => setShowPrompt(true), 800)
    return () => clearTimeout(t)
  }, [])

  if (!prompt || isNaN(slot) || slot < 1 || slot > 6) {
    return (
      <div className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <SectionMarker label="?" pageNum={0} />
        <p className="drop-cap" style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
          Invalid interrupt slot. This link may have expired or is malformed.
          Return to the beginning and try again.
        </p>
        <Divider variant="footer" />
      </div>
    )
  }

  const handleSubmit = async (responseText: string) => {
    setSubmitting(true)
    setError('')

    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 400))
      localStorage.removeItem(storageKey)
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please sign in again — your response is saved locally.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('responses').insert({
      user_id: user.id,
      slot,
      prompt_text: prompt,
      response_text: responseText,
      scheduled_for: new Date().toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      localStorage.removeItem(storageKey)
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <main className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <SectionMarker label={`${ROMAN[slot]}.`} />

        <Divider variant="medium" />

        <p className="drop-cap" style={{
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          marginTop: 'var(--space-paragraph)',
          marginBottom: 'var(--space-paragraph)',
        }}>
          Response recorded. The act of writing it down is the act of seeing.
          What you cannot name, you cannot change.
        </p>

        <Divider variant="dashed" />

        <p className="mono-meta" style={{ textAlign: 'center' }}>
          interrupt {ROMAN[slot]} of VI
        </p>

        <Link to="/history" className="nav-link" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-paragraph)' }}>
          view your reflections
        </Link>

        <Divider variant="footer" />
      </main>
    )
  }

  return (
    <main className="page" aria-label="Respond to interrupt" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label={`${ROMAN[slot]}.`} />

      <p className="mono-meta" style={{ marginBottom: 'var(--space-paragraph)' }}>
        {SLOT_TIMES[slot]} · interrupt {ROMAN[slot]} of VI
      </p>

      {showPrompt ? (
        <div style={{ animation: 'fadeIn 400ms ease-in-out' }}>
          <PromptCard
            prompt={prompt}
            onSubmit={handleSubmit}
            submitting={submitting}
            initialDraft={draft}
            onDraftChange={setDraft}
          />

          {error && (
            <p style={{
              color: 'var(--ember)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              marginTop: 'var(--space-paragraph)',
            }}>
              {error}
            </p>
          )}

          <Divider variant="dashed" />
        </div>
      ) : null}

      <Divider variant="footer" />
    </main>
  )
}
