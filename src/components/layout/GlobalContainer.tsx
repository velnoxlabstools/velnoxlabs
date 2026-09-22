import type { GlobalContainerProps } from '@/types/layout';
import { getContentMaxWidth, cx } from '@/helpers/layout';

export function GlobalContainer({
  children,
  className,
  maxWidth = 'xl',
}: GlobalContainerProps) {
  return (
    <div
      className={cx('global-container', className)}
      style={{
        width: '100%',
        maxWidth: getContentMaxWidth(maxWidth),
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
      }}
    >
      {children}
    </div>
  );
}
