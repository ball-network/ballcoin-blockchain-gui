import { type ServiceName } from '@ball-network/api';
import { ReactNode } from 'react';

import type WalletConnectCommandParam from './WalletConnectCommandParam';

type WalletConnectCommand = {
  command: string;
  label: ReactNode;
  description?: ReactNode;
  service: ServiceName;
  allFingerprints?: boolean;
  waitForSync?: boolean;
  params?: WalletConnectCommandParam[];
  bypassConfirm?: boolean;
};

export default WalletConnectCommand;
