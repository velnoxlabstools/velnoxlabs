const DEFAULT_BENEFITS = [
  'Save time with instant results',
  'Keep data on your device when possible',
  'Use free without creating an account',
];

interface ToolBenefitsSectionProps {
  benefits?: string[];
}

export function ToolBenefitsSection({ benefits = DEFAULT_BENEFITS }: ToolBenefitsSectionProps) {
  return (
    <section aria-labelledby="tool-benefits-heading">
      <h2
        id="tool-benefits-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        Benefits
      </h2>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {benefits.map((b) => (
          <li
            key={b}
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--foreground)',
            }}
          >
            <span aria-hidden="true" style={{ color: 'var(--primary)' }}>
              ✓
            </span>
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
