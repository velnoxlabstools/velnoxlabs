import type { PageWrapperProps } from '@/types/layout';
import { LAYOUT_IDS } from '@/constants/layout';
import { getLayoutMaxWidth, cx } from '@/helpers/layout';

export function PageWrapper({
  children,
  className,
  variant = 'default',
}: PageWrapperProps) {
  return (
    <div
      id={LAYOUT_IDS.pageWrapper}
      className={cx('page-wrapper', className)}
      style={{
        width: '100%',
        maxWidth: getLayoutMaxWidth(variant),
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
