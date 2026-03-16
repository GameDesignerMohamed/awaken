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
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-lg)',
        lineHeight: 1.7,
        marginBottom: 'var(--space-paragraph)',
        fontStyle: 'italic',
      }}>
        &ldquo;{prompt}&rdquo;
      </p>

      <textarea
        value={response}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your response..."
        rows={6}
        style={{
          width: '100%',
          resize: 'vertical',
          marginBottom: 'var(--space-paragraph)',
        }}
      />

      <button type="submit" disabled={!response.trim() || submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting...' : 'Submit \u25B8'}
      </button>
    </form>
  )
}
