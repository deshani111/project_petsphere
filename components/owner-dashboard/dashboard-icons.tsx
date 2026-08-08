import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function PawIcon(props: IconProps) { return <IconBase {...props}><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="15.5" cy="7.5" r="1.5" /><circle cx="5.5" cy="12" r="1.5" /><circle cx="18.5" cy="12" r="1.5" /><path d="M12 20c-2.8 0-5-1.6-5-3.7 0-1.8 2.2-4.1 5-4.1s5 2.3 5 4.1C17 18.4 14.8 20 12 20Z" /></IconBase>; }
export function GridIcon(props: IconProps) { return <IconBase {...props}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></IconBase>; }
export function SearchIcon(props: IconProps) { return <IconBase {...props}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></IconBase>; }
export function CalendarIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></IconBase>; }
export function MailIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></IconBase>; }
export function StoreIcon(props: IconProps) { return <IconBase {...props}><path d="M4 10v9h16v-9M3 10l2-5h14l2 5M3 10c.5 1.4 2.5 1.4 3 0 1 1.4 3 1.4 4 0 1 1.4 3 1.4 4 0 1 1.4 3 1.4 4 0 1 .9 2.3.7 3 0" /><path d="M9 19v-5h6v5" /></IconBase>; }
export function FileIcon(props: IconProps) { return <IconBase {...props}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></IconBase>; }
export function UserIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="8" r="3" /><path d="M5 21c.7-4 3.1-6 7-6s6.3 2 7 6" /></IconBase>; }
export function BellIcon(props: IconProps) { return <IconBase {...props}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></IconBase>; }
export function ClockIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></IconBase>; }
export function FilterIcon(props: IconProps) { return <IconBase {...props}><path d="M4 5h16M7 12h10M10 19h4" /></IconBase>; }
export function LogOutIcon(props: IconProps) { return <IconBase {...props}><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></IconBase>; }
