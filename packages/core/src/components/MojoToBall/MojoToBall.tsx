import BigNumber from 'bignumber.js';
import React from 'react';

import useCurrencyCode from '../../hooks/useCurrencyCode';
import mojoToBall from '../../utils/mojoToBallLocaleString';
import FormatLargeNumber from '../FormatLargeNumber';

export type MojoToBallProps = {
  value: number | BigNumber;
};

export default function MojoToBall(props: MojoToBallProps) {
  const { value } = props;
  const currencyCode = useCurrencyCode();
  const updatedValue = mojoToBall(value);

  return (
    <>
      <FormatLargeNumber value={updatedValue} />
      &nbsp;{currencyCode ?? ''}
    </>
  );
}
