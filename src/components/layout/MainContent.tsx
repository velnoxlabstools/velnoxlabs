import type { MainContentProps } from '@/types/layout';
import { LAYOUT_IDS } from '@/constants/layout';
import { cx } from '@/helpers/layout';

export function MainContent({
  children,
  className,
  as: Component = 'main',
}: MainContentProps) {
  return (
    <Component
      id={LAYOUT_IDS.mainContent}
      className={cx('main-content', className)}
      style={{
        flex: '1 1 auto',
        width: '100%',
        minHeight: 0,
      }}
    >
      {children}
    </Component>
  );
}
