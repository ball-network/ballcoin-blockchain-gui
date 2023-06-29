import { useGetNetworkInfoQuery } from '@ball-network/api-react';

export default function useIsMainnet(): boolean | undefined {
  const { data: networkInfo } = useGetNetworkInfoQuery();
  const networkPrefix = networkInfo?.networkPrefix;

  if (!networkPrefix) {
    return undefined;
  }

  return networkPrefix.toLowerCase() === 'ball';
}
