import { IconProps } from '../types';

// <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <rect x="0" y="0" width="3" height="24" rx="1" fill="currentColor" />
//   <rect x="21" y="0" width="3" height="24" rx="1" fill="currentColor" />
//   <rect x="8" y="4" width="9" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
// </svg>
const IconTrimming = ({ size = 24}: IconProps) => (
<svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 12C3 11.4477 3.44772 11 4 11H24C24.5523 11 25 11.4477 25 12V13H4C3.44772 13 3 12.5523 3 12V12Z" fill="currentColor"/>
<path d="M25 13L25 32C25 32.5523 24.5523 33 24 33V33C23.4477 33 23 32.5523 23 32L23 13L25 13Z" fill="currentColor"/>
<path d="M33 24C33 24.5523 32.5523 25 32 25L12 25C11.4477 25 11 24.5523 11 24L11 23L32 23C32.5523 23 33 23.4477 33 24V24Z" fill="currentColor"/>
<path d="M11 23L11 4C11 3.44772 11.4477 3 12 3V3C12.5523 3 13 3.44772 13 4L13 23L11 23Z" fill="currentColor"/>
</svg>


);
IconTrimming.displayName = 'IconTrimming';

export { IconTrimming };
