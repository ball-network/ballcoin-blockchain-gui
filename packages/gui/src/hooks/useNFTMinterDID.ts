import { useMemo } from 'react';
import { useGetNFTInfoQuery } from '@ball-network/api-react';
import { launcherIdFromNFTId } from '../util/nfts';
import { stripHexPrefix } from '../util/utils';
import { didToDIDId } from '../util/dids';

export type UseNFTMinterDIDResult = {
  didId: string | undefined;
  hexDIDId: string | undefined;
  didName: string | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

export default function useNFTMinterDID(nftId: string): UseNFTMinterDIDResult {
  const launcherId = launcherIdFromNFTId(nftId);
  const {
    data: nft,
    isLoading,
    error,
  } = useGetNFTInfoQuery({ coinId: launcherId ?? '' });

  const [didId, hexDIDId, didName] = useMemo(() => {
    if (!nft) {
      return [];
    }
    const { minterDid } = nft;
    if (!minterDid) {
      return [];
    }
    const hexDIDId = stripHexPrefix(minterDid);
    const didId = didToDIDId(hexDIDId);
    let didName;

    if (
      didId ===
      'did:ball:19qf3g9876t0rkq7tfdkc28cxfy424yzanea29rkzylq89kped9hq3q7wd2'
    ) {
      didName = 'Ball Network';
    }

    return [didId, hexDIDId, didName];
  }, [nft]);

  return { didId, hexDIDId, didName, isLoading, error };
}
