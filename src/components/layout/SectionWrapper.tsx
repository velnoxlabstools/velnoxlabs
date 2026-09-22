import type { SectionWrapperProps } from '@/types/layout';
import { getContentMaxWidth, cx } from '@/helpers/layout';

export function SectionWrapper({
  children,
  className,
  id,
  as: Component = 'section',
  width = 'full',
}: SectionWrapperProps) {
  return (
    <Component
      id={id}
      className={cx('section-wrapper', className)}
      style={{
        width: '100%',
        maxWidth: width === 'full' ? undefined : getContentMaxWidth(width),
        marginLeft: width === 'full' ? undefined : 'auto',
        marginRight: width === 'full' ? undefined : 'auto',
      }}
    >
      {children}
    </Component>
  );
}
