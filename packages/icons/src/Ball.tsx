import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import BallIcon from './images/ball.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={BallIcon} viewBox="0 0 400 400" {...props} />;
}
