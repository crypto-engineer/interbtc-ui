import { forwardRef } from 'react';

import { Icon, IconProps } from '@/component-library/Icon';

const IBTC = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon {...props} ref={ref} viewBox='0 0 45 45' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <title>IBTC</title>
    <circle cx='22.5' cy='22.5' r='22' fill='#fff' stroke='#F90' />
    <path
      d='M37.468 35H17.14a.51.51 0 0 1-.274-.082l-7.344-4.766a.539.539 0 0 1-.219-.267.572.572 0 0 1-.017-.352.547.547 0 0 1 .19-.29.502.502 0 0 1 .32-.107h20.328a.5.5 0 0 1 .274.082l7.345 4.765a.54.54 0 0 1 .22.267c.042.113.049.237.017.353a.547.547 0 0 1-.191.29.502.502 0 0 1-.32.107ZM17.288 33.9h18.344l-5.656-3.667H11.632l5.656 3.667Zm18.915-18.037H15.875a.51.51 0 0 1-.274-.082l-7.345-4.766a.539.539 0 0 1-.219-.267.572.572 0 0 1-.018-.351.547.547 0 0 1 .19-.29.502.502 0 0 1 .319-.108H28.86c.097 0 .192.029.275.082l7.34 4.766a.539.539 0 0 1 .218.267.572.572 0 0 1 .018.352.547.547 0 0 1-.19.29.502.502 0 0 1-.32.107h.001Zm-20.18-1.098h18.344l-5.656-3.668H10.367l5.656 3.668Z'
      fill='#1A0A2D'
    />
    <path
      d='M23.363 22.21c.422 0 .978-.05 1.29-.384a.755.755 0 0 0 .179-.261c.04-.1.06-.207.059-.315-.01-.76-.606-1.028-1.164-1.026h-.84l.006 1.949.095.012c.125.015.25.024.375.024Zm.42.63-.887.01.007 2.285h.897c.658 0 1.36-.305 1.362-1.147a1.068 1.068 0 0 0-.063-.407 1.03 1.03 0 0 0-.212-.347c-.352-.368-.934-.395-1.105-.394Z'
      fill='#F90'
    />
    <path
      d='M27.186 18.527a5.125 5.125 0 0 0-3.738-1.501h-.055c-1.399.05-2.721.68-3.68 1.75a5.73 5.73 0 0 0-1.435 3.969c.04 1.47.63 2.863 1.644 3.877a5.157 5.157 0 0 0 3.767 1.532h.053a5.13 5.13 0 0 0 2.91-1.04 5.542 5.542 0 0 0 1.872-2.564 5.835 5.835 0 0 0 .2-3.224 5.637 5.637 0 0 0-1.538-2.799Zm-1.581 6.932a2.834 2.834 0 0 1-1.027.216h-.107l-.009.113v1.101h-.784v-1.222l-.773.006v1.214h-.791l-.002-1.21-1.329.012v-.546h.493c.1 0 .196-.043.266-.117a.407.407 0 0 0 .11-.28l-.013-4.12c0-.206-.156-.349-.377-.349l-.495-.036v-.76h1.343v-1.253h.778v1.254h.78v-1.257h.778v1.258h.143c.27 0 1.619.295 1.622 1.442 0 1.265-1.009 1.402-1.026 1.44l-.054.005c.056.006 1.374.272 1.365 1.737-.008.635-.3 1.089-.891 1.352Z'
      fill='#F90'
    />
  </Icon>
));

IBTC.displayName = 'IBTC';

export { IBTC };