import { useState } from 'react'

interface PromptCardProps {
  prompt: string
  onSubmit: (response: string) => void
  submitting?: boolean
  initialDraft?: string
  onDraftChange?: (draft: string) => void
}

export default function PromptCard({ prompt, onSubmit, submitting, initialDraft = '', onDraftChange }: PromptCardProps) {
  const [response, setResponse] = useState(initialDraft)

  const handleChange = (value: string) => {
    setResponse(value)
    onDraftChange?.(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (response.trim()) {
      onSubmit(response.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="drop-cap" style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-lg)',
        fontWeight: 600,
        lineHeight: 1.75,
        marginBottom: 'var(--space-section)',
      }}>
        {prompt}
      </p>

      {initialDraft && (
        <p className="mono-meta" style={{ marginBottom: 'var(--space-line)' }}>
          draft restored from earlier.
        </p>
      )}

      <textarea
        value={response}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your response..."
        rows={7}
        style={{
          width: '100%',
          resize: 'vertical',
          marginBottom: 'var(--space-paragraph)',
        }}
      />

      <button type="submit" disabled={!response.trim() || submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
