export default function SectionMarker({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: 'var(--ink-light)',
      marginBottom: 'var(--space-paragraph)',
    }}>
      &sect; {label}
    </div>
  )
}
