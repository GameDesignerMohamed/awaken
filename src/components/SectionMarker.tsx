// Ornate cross for top-right corner — @instance_11 reference
// Weight variation: heavier vertical strokes, lighter horizontal — mimics letterpress
function HeaderOrnament() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="currentColor">
      {/* Center diamond */}
      <rect x="11.5" y="11.5" width="5.8" height="5.8" transform="rotate(45 14 14)" />
      {/* Cardinal dots */}
      <circle cx="14" cy="2" r="2.1" />
      <circle cx="14" cy="26" r="2.1" />
      <circle cx="2" cy="14" r="1.9" />
      <circle cx="26" cy="14" r="1.9" />
      {/* Axis lines — vertical heavier than horizontal */}
      <line x1="14" y1="5.2" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="18" x2="14" y2="22.8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5.2" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.1" />
      <line x1="18" y1="14" x2="22.8" y2="14" stroke="currentColor" strokeWidth="1.1" />
      {/* Diagonal accent dots */}
      <circle cx="6.5" cy="6.5" r="1" />
      <circle cx="21.5" cy="6.5" r="0.9" />
      <circle cx="6.5" cy="21.5" r="0.9" />
      <circle cx="21.5" cy="21.5" r="1" />
    </svg>
  )
}

export default function SectionMarker({ label, pageNum }: { label: string; pageNum?: number }) {
  return (
    <div className="page-header">
      <span className="page-header__section">{label}</span>
      {pageNum !== undefined ? (
        <span className="page-header__section">{pageNum}</span>
      ) : (
        <span className="page-header__ornament">
          <HeaderOrnament />
        </span>
      )}
    </div>
  )
}
