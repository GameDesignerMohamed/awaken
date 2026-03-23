// Ornamental cross/diamond motif — @instance_11 / Second Nature reference
// Varying stroke weights and slightly heavier diamond fills for hand-cut feel
function CrossOrnament({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
      {/* Center diamond — heavier fill */}
      <rect x="13.5" y="13.5" width="5.5" height="5.5" transform="rotate(45 16 16)" />
      {/* Cardinal dots — slightly different sizes for organic feel */}
      <circle cx="16" cy="2.5" r="2.2" />
      <circle cx="16" cy="29.5" r="2.2" />
      <circle cx="2.5" cy="16" r="2" />
      <circle cx="29.5" cy="16" r="2" />
      {/* Axis lines — varying weights */}
      <line x1="16" y1="5.8" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="16" y1="20.5" x2="16" y2="26.2" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5.8" y1="16" x2="11.5" y2="16" stroke="currentColor" strokeWidth="1.1" />
      <line x1="20.5" y1="16" x2="26.2" y2="16" stroke="currentColor" strokeWidth="1.1" />
      {/* Diagonal accent dots — smaller, subordinate */}
      <circle cx="7.5" cy="7.5" r="1.1" />
      <circle cx="24.5" cy="7.5" r="1" />
      <circle cx="7.5" cy="24.5" r="1" />
      <circle cx="24.5" cy="24.5" r="1.1" />
    </svg>
  )
}

function SmallCross() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="1.8" r="1.4" />
      <circle cx="8" cy="14.2" r="1.4" />
      <circle cx="1.8" cy="8" r="1.3" />
      <circle cx="14.2" cy="8" r="1.3" />
      <rect x="6.8" y="6.8" width="3.2" height="3.2" transform="rotate(45 8 8)" />
    </svg>
  )
}

function DotChain() {
  return (
    <svg width="48" height="8" viewBox="0 0 48 8" fill="currentColor">
      <circle cx="4" cy="4" r="1.3" />
      <line x1="6.5" y1="4" x2="13.5" y2="4" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="16" cy="4" r="1.9" />
      <line x1="19" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="0.7" />
      <rect x="25.5" y="1.5" width="3.5" height="3.5" transform="rotate(45 27.25 3.25)" fill="currentColor" />
      <line x1="30" y1="4" x2="35" y2="4" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="37.5" cy="4" r="1.9" />
      <line x1="40.5" y1="4" x2="46" y2="4" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="48" cy="4" r="1.3" />
    </svg>
  )
}

export default function Divider({ variant = 'simple' }: { variant?: 'simple' | 'medium' | 'footer' | 'dashed' }) {
  if (variant === 'footer') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--space-paragraph)',
        marginTop: 'var(--space-section)',
        color: 'var(--ink)',
      }}>
        <DotChain />
        <CrossOrnament size={24} />
        <DotChain />
        <SmallCross />
        <DotChain />
        <CrossOrnament size={24} />
        <DotChain />
      </div>
    )
  }

  if (variant === 'medium') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        padding: 'var(--space-paragraph) 0',
        color: 'var(--ink)',
        userSelect: 'none',
      }}>
        <svg width="56" height="2" viewBox="0 0 56 2">
          <line x1="0" y1="1" x2="56" y2="1" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 3" />
        </svg>
        <SmallCross />
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="3.5" y="3.5" width="5" height="5" transform="rotate(45 5 5)" />
        </svg>
        <SmallCross />
        <svg width="56" height="2" viewBox="0 0 56 2">
          <line x1="0" y1="1" x2="56" y2="1" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 3" />
        </svg>
      </div>
    )
  }

  if (variant === 'dashed') {
    return (
      <hr className="dashed-rule" />
    )
  }

  // simple
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      padding: 'var(--space-paragraph) 0',
      color: 'var(--ink)',
      userSelect: 'none',
    }}>
      <svg width="50" height="2" viewBox="0 0 50 2">
        <line x1="0" y1="1" x2="50" y2="1" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        <circle cx="4" cy="4" r="2.8" />
      </svg>
      <svg width="50" height="2" viewBox="0 0 50 2">
        <line x1="0" y1="1" x2="50" y2="1" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}
