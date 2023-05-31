import React from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '@mui/material';
import { Ball } from '@ball-network/icons';

const StyledBall = styled(Ball)`
  max-width: 100%;
  width: auto;
  height: auto;
`;

export default function Logo(props: BoxProps) {
  return (
    <Box {...props}>
      <StyledBall />
    </Box>
  );
}
