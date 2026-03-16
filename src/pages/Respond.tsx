import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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

export default function Respond() {
  const [searchParams] = useSearchParams()
  const slotParam = searchParams.get('slot')
  const slot = slotParam ? parseInt(slotParam, 10) : NaN
  const prompt = PROMPTS[slot]

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  if (!prompt || isNaN(slot) || slot < 1 || slot > 6) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 'var(--space-section)' }}>
        <SectionMarker label="Error" />
        <p style={{ fontSize: 'var(--text-base)' }}>
          Invalid interrupt slot.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 'var(--space-line)' }}>
          This link may have expired or is malformed.
        </p>
      </div>
    )
  }

  const handleSubmit = async (responseText: string) => {
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Session expired — draft is already in localStorage
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
      <div className="page" style={{ textAlign: 'center', paddingTop: 'var(--space-section)' }}>
        <SectionMarker label="Done" />
        <Divider variant="medium" />
        <p style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-paragraph)' }}>
          Response recorded.
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-faint)',
          marginTop: 'var(--space-paragraph)',
        }}>
          Interrupt {slot} of 6
        </p>
        <Divider variant="elaborate" />
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="Interrupt" />

      <PromptCard
        prompt={prompt}
        onSubmit={handleSubmit}
        submitting={submitting}
        initialDraft={draft}
        onDraftChange={setDraft}
      />

      {error && (
        <p style={{ color: 'var(--ember)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-paragraph)' }}>
          {error}
        </p>
      )}

      <Divider variant="medium" />

      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-faint)',
        textAlign: 'center',
      }}>
        Interrupt {slot} of 6
      </p>
    </div>
  )
}
