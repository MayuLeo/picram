import { IconProps } from '../types';

{/* <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="24" height="3" rx="1" fill="currentColor" />
<rect x="0" y="21" width="24" height="3" rx="1" fill="currentColor" />
<rect x="4" y="8" width="16" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
</svg> */}
const IconHorizontalFrame = ({ size = 24}: IconProps) => (
<svg width={size} height={size} viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2004_1299)">
<path d="M36.5 4L0.5 4L0.5 2C0.5 0.895429 1.39543 3.05027e-08 2.5 1.27067e-07L34.5 2.9246e-06C35.6046 3.02116e-06 36.5 0.895434 36.5 2L36.5 4Z" fill="currentColor" />
<path d="M36.5 34C36.5 35.1046 35.6046 36 34.5 36L2.5 36C1.39543 36 0.5 35.1046 0.5 34L0.5 32L36.5 32L36.5 34Z" fill="currentColor"/>
<path d="M5.5 27L12.5909 17.6667L17.9091 24.6667H26.7727L20.8636 16.9083L17.9091 20.7583L16.4318 18.8333L20.8636 13L31.5 27H5.5ZM10.2273 24.6667H14.9545L12.5909 21.5458L10.2273 24.6667Z" fill="currentColor"/>
</g>
<defs>
<clipPath id="clip0_2004_1299">
<rect width="36" height="36" fill="white" transform="translate(0.5)"/>
</clipPath>
</defs>
</svg>

);
IconHorizontalFrame.displayName = 'IconHorizontalFrame';

export { IconHorizontalFrame };
