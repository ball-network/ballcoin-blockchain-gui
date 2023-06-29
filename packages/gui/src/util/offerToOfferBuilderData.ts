import { OfferSummaryRecord } from '@ball-network/api';
import { mojoToCAT, mojoToBall } from '@ball-network/core';
import BigNumber from 'bignumber.js';

import type OfferBuilderData from '../@types/OfferBuilderData';
import type OfferSummary from '../@types/OfferSummary';
import { launcherIdToNFTId } from './nfts';

export default function offerToOfferBuilderData(
  offerSummary: OfferSummary | OfferSummaryRecord,
  setDefaultOfferedFee: boolean,
  defaultFee?: string // in mojos
): OfferBuilderData {
  const { fees, offered, requested, infos } = offerSummary;

  const defaultFeeBALL = defaultFee ? mojoToBall(defaultFee).toFixed() : '';

  const offeredBall: OfferBuilderData['offered']['ball'] = [];
  const offeredTokens: OfferBuilderData['offered']['tokens'] = [];
  const offeredNfts: OfferBuilderData['offered']['nfts'] = [];
  const offeredFee: OfferBuilderData['offered']['fee'] = setDefaultOfferedFee ? [{ amount: defaultFeeBALL }] : [];
  const requestedBall: OfferBuilderData['requested']['ball'] = [];
  const requestedTokens: OfferBuilderData['requested']['tokens'] = [];
  const requestedNfts: OfferBuilderData['requested']['nfts'] = [];

  // processing requested first because it's what you/we will give

  Object.keys(requested).forEach((id) => {
    const amount = new BigNumber(requested[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      offeredTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      offeredNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'ball') {
      offeredBall.push({
        amount: mojoToBall(amount).toFixed(),
      });
    }
  });

  Object.keys(offered).forEach((id) => {
    const amount = new BigNumber(offered[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      requestedTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
      });
    } else if (info?.type === 'singleton') {
      requestedNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'ball') {
      requestedBall.push({
        amount: mojoToBall(amount).toFixed(),
      });
    }
  });

  return {
    offered: {
      ball: offeredBall,
      tokens: offeredTokens,
      nfts: offeredNfts,
      fee: offeredFee,
    },
    requested: {
      ball: requestedBall,
      tokens: requestedTokens,
      nfts: requestedNfts,
      fee: [
        {
          amount: mojoToBall(fees).toFixed(),
        },
      ],
    },
  };
}
