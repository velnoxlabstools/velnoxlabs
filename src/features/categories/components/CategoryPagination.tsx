interface CategoryPaginationProps {
  page: number;
  totalPages: number;
}

/**
 * Architecture-only pagination display.
 */
export function CategoryPagination({ page, totalPages }: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Category pagination"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-8)',
      }}
    >
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
        Page {page} of {totalPages}
      </span>
    </nav>
  );
}
