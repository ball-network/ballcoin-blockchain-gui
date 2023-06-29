import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

import BallBlackIcon from './images/ball-black.svg';
import BallIcon from './images/ball.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={BallIcon} viewBox="0 0 400 400" {...props} />;
}

export function BallBlack(props: SvgIconProps) {
  return <SvgIcon component={BallBlackIcon} viewBox="0 0 400 400" sx={{ width: '100px', height: '100px' }} {...props} />;
}
