import type { ReactNode } from "react";

/** Small outline icons (24px grid). Decorative: the button that holds them carries the label. */
const PATHS: Record<string, ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />,
  chat: <path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-3.9A8 8 0 1 1 20 12Z" />,
  bookmark: <path d="M6.5 4h11v16.5L12 16.8l-5.5 3.7Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4Z" />,
  sparkle: <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9ZM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1-4 4-5.5 7.5-5.5s6.5 1.5 7.5 5.5" />
    </>
  ),
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  filter: <path d="M4 5h16l-6 7.5V19l-4-2v-4.5Z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, filled = false, size = 22 }: { name: IconName; filled?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
