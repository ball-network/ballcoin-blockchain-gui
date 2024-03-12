import {
  LayoutDashboardSub,
  useSerializedNavigationState,
} from '@ball-network/core';
import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';

import Wallet from './Wallet';
import WalletsSidebar from './WalletsSidebar';
import WalletCreate from './create/WalletCreate';
import WalletStakeOld from './stakeOld/WalletStakeOld';

export default function Wallets() {
  const { getLocationState } = useSerializedNavigationState();
  const locationState = getLocationState(); // For cases where we know that the state has been serialized
  return (
    <Routes>
      <Route element={<LayoutDashboardSub outlet />}>
        <Route path="create/*" element={<WalletCreate />} />
        <Route
          path="stakeOld"
          element={
            <WalletStakeOld
              walletId={locationState?.walletId}
            />
          }
        />
      </Route>
      <Route element={<LayoutDashboardSub sidebar={<WalletsSidebar />} outlet />}>
        <Route path=":walletId" element={<Wallet />} />
        <Route path="*" element={<Navigate to="1" />} />
      </Route>
    </Routes>
  );
}
