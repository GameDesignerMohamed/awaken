export default function Divider({ variant = 'simple' }: { variant?: 'simple' | 'medium' | 'elaborate' }) {
  const dividers = {
    simple: '\u2500\u2500\u2500 \u2022 \u2500\u2500\u2500',
    medium: '\u2500\u2500 \u2022\u25C6\u2022 \u2500\u2500',
    elaborate: '\u2500\u2022\u25C7\u2022\u2500 \u25C6 \u2500\u2022\u25C7\u2022\u2500',
  }

  return (
    <div style={{
      textAlign: 'center',
      color: 'var(--ink-faint)',
      fontSize: 'var(--text-sm)',
      padding: 'var(--space-paragraph) 0',
      letterSpacing: '0.2em',
      userSelect: 'none',
    }}>
      {dividers[variant]}
    </div>
  )
}
