import { IconProps } from '../types';

// <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <rect x="0" y="0" width="3" height="24" rx="1" fill="currentColor" />
//   <rect x="21" y="0" width="3" height="24" rx="1" fill="currentColor" />
//   <rect x="3" y="0" width="18" height="3" rx="1" fill="currentColor" />
//   <rect x="3" y="21" width="18" height="3" rx="1" fill="currentColor" />
//   <rect x="8" y="8" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
// </svg>
const IconFrame = ({ size = 24}: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2004_1295)">
<path d="M5.5 26.2703L12.5909 17.1892L17.9091 24H26.7727L20.8636 16.4514L17.9091 20.1973L16.4318 18.3244L20.8636 12.6487L31.5 26.2703H5.5ZM10.2273 24H14.9545L12.5909 20.9635L10.2273 24Z" fill="currentColor"/>
<path d="M2.5 36C1.39543 36 0.5 35.1046 0.5 34L0.5 2C0.5 0.895432 1.39543 1.06779e-08 2.5 2.38498e-08L4.5 4.76995e-08L4.5 36L2.5 36Z" fill="currentColor"/>
<path d="M32.5 36L32.5 0L34.5 -8.74228e-08C35.6046 -1.35705e-07 36.5 0.895431 36.5 2L36.5 34C36.5 35.1046 35.6046 36 34.5 36L32.5 36Z" fill="currentColor"/>
<rect width="28" height="4" transform="translate(32.5 4) rotate(-180)" fill="currentColor"/>
<rect width="28" height="4" transform="translate(32.5 36) rotate(-180)" fill="currentColor"/>
</g>
<defs>
<clipPath id="clip0_2004_1295">
<rect width="36" height="36" fill="white" transform="translate(0.5)"/>
</clipPath>
</defs>
</svg>

);
IconFrame.displayName = 'IconFrame';

export { IconFrame };
