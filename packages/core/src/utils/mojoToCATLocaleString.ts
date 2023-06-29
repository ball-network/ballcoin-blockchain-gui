import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';
import ballFormatter from './ballFormatter';

export default function mojoToCATLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return ballFormatter(mojo, Unit.MOJO).to(Unit.CAT).toLocaleString(locale);
}
