export const durations = {
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
} as const;

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const transitions = {
  none: 'none',
  all: `all ${durations.normal} ${easings.inOut}`,
  colors: `color ${durations.fast} ${easings.inOut}, background-color ${durations.fast} ${easings.inOut}, border-color ${durations.fast} ${easings.inOut}`,
  opacity: `opacity ${durations.normal} ${easings.inOut}`,
  shadow: `box-shadow ${durations.normal} ${easings.inOut}`,
  transform: `transform ${durations.normal} ${easings.inOut}`,
} as const;

export const animations = {
  none: 'none',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
} as const;
