import type { Wallet } from '@ball-network/api';
import { WalletType } from '@ball-network/api';
import { ballToMojo, catToMojo } from '@ball-network/core';
import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import type Driver from '../@types/Driver';
import type OfferBuilderData from '../@types/OfferBuilderData';
import type { OfferTradeRecordFormatted } from '../hooks/useWalletOffers';

import findCATWalletByAssetId from './findCATWalletByAssetId';
import { getBalance, WalletBalanceFormatted } from './hasSpendableBalance';
import { prepareNFTOfferFromNFTId } from './prepareNFTOffer';

// Status of existing assets in offers
// A combination of `type` and `assetId` must be unique through an array of `AssetStatusForOffer`.
export type AssetStatusForOffer = {
  type: 'BALL' | 'CAT' | 'SINGLETON';
  assetId: string;
  assetName?: string; // Used just for labeling
  nftId?: string;
  lockedAmount: BigNumber;
  spendingAmount: BigNumber;
  spendableAmount: BigNumber;
  confirmedAmount: BigNumber;
  // - alsoUsedInNewOfferWithoutConflict
  //   The same asset is also offered in new offer but the amount is sufficient.
  //   Even existing offers are all settled, new offer won't fail because of lacked coin amount.
  // - conflictsWithNewOffer
  //   The same asset is also offered in new offer and only one of existing offers or new offer
  //   can be settled because not enough amount is spendable.
  status: '' | 'alsoUsedInNewOfferWithoutConflict' | 'conflictsWithNewOffer';
  relevantOffers: OfferTradeRecordFormatted[];
};

export type OfferBuilderDataToOfferParams = {
  data: OfferBuilderData;
  wallets: Wallet[];
  offers: OfferTradeRecordFormatted[];
  validateOnly?: boolean;
  considerNftRoyalty?: boolean;
  allowEmptyOfferColumn?: boolean;
  allowUnknownRequestedCATs?: boolean;
};

// Amount exceeds spendable balance
export default async function offerBuilderDataToOffer({
  data,
  wallets,
  offers,
  validateOnly = false,
  considerNftRoyalty = false,
  allowEmptyOfferColumn = false,
  allowUnknownRequestedCATs = false,
}: OfferBuilderDataToOfferParams): Promise<{
  walletIdsAndAmounts?: Record<string, BigNumber>;
  driverDict?: Record<string, any>;
  feeInMojos: BigNumber;
  validateOnly?: boolean;
  assetsToUnlock: AssetStatusForOffer[];
}> {
  const {
    offered: { ball: offeredBall = [], tokens: offeredTokens = [], nfts: offeredNfts = [], fee: [firstFee] = [] },
    requested: { ball: requestedBall = [], tokens: requestedTokens = [], nfts: requestedNfts = [] },
  } = data;

  const usedNFTs: string[] = [];

  const feeInMojos = firstFee ? ballToMojo(firstFee.amount) : new BigNumber(0);

  const walletIdsAndAmounts: Record<string, BigNumber> = {};
  const driverDict: Record<string, Driver> = {};

  if (!allowEmptyOfferColumn) {
    const hasOffer = !!offeredBall.length || !!offeredTokens.length || !!offeredNfts.length;

    if (!hasOffer) {
      throw new Error(t`Please specify at least one offered asset`);
    }
  }

  const pendingOffers: AssetStatusForOffer[] = [];

  for (let i = 0; i < offers.length; i++) {
    const o = offers[i];
    if (o.isMyOffer && o.status === 'PENDING_ACCEPT') {
      const assetIds = Object.keys(o.pending) as string[];
      for (let k = 0; k < assetIds.length; k++) {
        const assetId = assetIds[k];
        const lockedAmount = new BigNumber(o.pending[assetId]);
        if (assetId.toUpperCase() === 'BALL' || assetId.toUpperCase() === 'UNKNOWN') {
          // 'UNKNOWN' is the diff between removals and additions of coins in this offer
          // It is assumed to be the amount of the 'fee'
          const idx = pendingOffers.findIndex((po) => po.type === 'BALL');
          if (idx > -1) {
            pendingOffers[idx].lockedAmount = pendingOffers[idx].lockedAmount.plus(lockedAmount);
            pendingOffers[idx].relevantOffers.push(o);
            if (pendingOffers[idx].assetId.toUpperCase() !== assetId.toUpperCase()) {
              // Now we can distinguish that we have ball spending which is only BALL, only Fee or both BALL and Fee
              pendingOffers[idx].assetId = 'BALL+FEE';
            }
          } else {
            pendingOffers.push({
              type: 'BALL',
              assetId,
              assetName: 'BALL',
              lockedAmount,
              status: '',
              spendingAmount: new BigNumber(0),
              spendableAmount: new BigNumber(0),
              confirmedAmount: new BigNumber(0),
              relevantOffers: [o],
            });
          }
        } else {
          const info = o.summary.infos[assetId];
          const type = info.type.toUpperCase() as 'CAT' | 'SINGLETON';
          const idx = pendingOffers.findIndex((po) => po.type === type && po.assetId === assetId);
          if (idx > -1) {
            pendingOffers[idx].lockedAmount = pendingOffers[idx].lockedAmount.plus(lockedAmount);
            pendingOffers[idx].relevantOffers.push(o);
          } else {
            pendingOffers.push({
              type,
              assetId,
              lockedAmount,
              status: '',
              spendingAmount: new BigNumber(0),
              spendableAmount: new BigNumber(0),
              confirmedAmount: new BigNumber(0),
              relevantOffers: [o],
            });
          }
        }
      }
    }
  }

  let standardWallet: Wallet | undefined;
  let standardWalletBalance: WalletBalanceFormatted | undefined;
  let pendingBallOffer: AssetStatusForOffer | undefined;
  let pendingBall = new BigNumber(0);
  if (offeredBall.length > 0 || feeInMojos.gt(0)) {
    standardWallet = wallets.find((w) => w.type === WalletType.STANDARD_WALLET);
    for (let i = 0; i < pendingOffers.length; i++) {
      const po = pendingOffers[i];
      if (po.type === 'BALL') {
        pendingBallOffer = po;
        pendingBall = po.lockedAmount;
        break;
      }
    }
    if (standardWallet) {
      standardWalletBalance = await getBalance(standardWallet.id);
    }
  }

  // offeredBall.length should be always 0 or 1
  const ballTasks = offeredBall.map(async (ball) => {
    const { amount } = ball;
    if (!amount || amount === '0') {
      throw new Error(t`Please enter an BALL amount`);
    }
    if (!standardWallet || !standardWalletBalance) {
      throw new Error(t`No standard wallet found`);
    }

    const mojoAmount = ballToMojo(amount);
    walletIdsAndAmounts[standardWallet.id] = mojoAmount.negated();

    const spendableBalance = new BigNumber(standardWalletBalance.spendableBalance);
    const hasEnoughTotalBalance = spendableBalance.plus(pendingBall).minus(feeInMojos).gte(mojoAmount);
    if (!hasEnoughTotalBalance) {
      throw new Error(t`Amount exceeds BALL total balance`);
    }

    if (pendingBallOffer) {
      // Assuming offeredBall.length is always less then or equal to 1
      pendingBallOffer.spendingAmount = mojoAmount.plus(feeInMojos);
      pendingBallOffer.spendableAmount = spendableBalance;
      pendingBallOffer.confirmedAmount = new BigNumber(standardWalletBalance.confirmedWalletBalance);
      const hasEnoughSpendableBalance = spendableBalance.gte(pendingBallOffer.spendingAmount);
      if (!hasEnoughSpendableBalance) {
        pendingBallOffer.status = 'conflictsWithNewOffer';
      } else {
        pendingBallOffer.status = 'alsoUsedInNewOfferWithoutConflict';
      }
    }
  });
  // Treat fee as ball spending
  if (offeredBall.length === 0 && feeInMojos.gt(0)) {
    if (!standardWallet || !standardWalletBalance) {
      throw new Error(t`No standard wallet found`);
    }

    const spendableBalance = new BigNumber(standardWalletBalance.spendableBalance);
    const hasEnoughTotalBalance = spendableBalance.gte(feeInMojos);
    if (!hasEnoughTotalBalance) {
      throw new Error(t`Fee exceeds BALL total balance`);
    }
    if (pendingBallOffer) {
      pendingBallOffer.spendingAmount = feeInMojos;
      pendingBallOffer.spendableAmount = spendableBalance;
      pendingBallOffer.confirmedAmount = new BigNumber(standardWalletBalance.confirmedWalletBalance);
      const hasEnoughSpendableBalance = spendableBalance.gte(pendingBallOffer.spendingAmount);
      if (!hasEnoughSpendableBalance) {
        pendingBallOffer.status = 'conflictsWithNewOffer';
      } else {
        pendingBallOffer.status = 'alsoUsedInNewOfferWithoutConflict';
      }
    }
  }

  const tokenTasks = offeredTokens.map(async (token) => {
    const { assetId, amount } = token;

    if (!assetId) {
      throw new Error(t`Please select an asset for each token`);
    }

    const catWallet = findCATWalletByAssetId(wallets, assetId);
    if (!catWallet) {
      throw new Error(t`No CAT wallet found for ${assetId} token`);
    }

    const catName = catWallet.meta?.name || 'Unknown token';

    if (!amount || amount === '0') {
      throw new Error(t`Please enter an amount for ${catName} token`);
    }

    const mojoAmount = catToMojo(amount);
    walletIdsAndAmounts[catWallet.id] = mojoAmount.negated();

    const pendingCatOffer = pendingOffers.find((po) => po.type === 'CAT' && po.assetId === assetId);
    const pendingCat = pendingCatOffer ? pendingCatOffer.lockedAmount : new BigNumber(0);

    const walletBalance = await getBalance(catWallet.id);
    const spendableBalance = new BigNumber(walletBalance.spendableBalance);
    const hasEnoughTotalBalance = spendableBalance.plus(pendingCat).gte(mojoAmount);
    if (!hasEnoughTotalBalance) {
      throw new Error(t`Amount exceeds total balance for ${catName} token`);
    }

    if (pendingCatOffer) {
      // Assuming no duplicate of `assetId` exists in `offeredTokens`
      pendingCatOffer.spendingAmount = mojoAmount;
      pendingCatOffer.spendableAmount = spendableBalance;
      pendingCatOffer.confirmedAmount = new BigNumber(walletBalance.confirmedWalletBalance);
      pendingCatOffer.assetName = catName;
      const hasEnoughSpendableBalance = spendableBalance.gte(mojoAmount);
      if (!hasEnoughSpendableBalance) {
        pendingCatOffer.status = 'conflictsWithNewOffer';
      } else {
        pendingCatOffer.status = 'alsoUsedInNewOfferWithoutConflict';
      }
    }
  });

  const nftTasks = offeredNfts.map(async ({ nftId }) => {
    if (usedNFTs.includes(nftId)) {
      throw new Error(t`NFT ${nftId} is already used in this offer`);
    }
    usedNFTs.push(nftId);

    const { id, amount, driver } = await prepareNFTOfferFromNFTId(nftId, true);

    walletIdsAndAmounts[id] = amount;
    if (driver) {
      driverDict[id] = driver;
    }

    const pendingNft = pendingOffers.find((po) => po.type === 'SINGLETON' && po.assetId === id);
    if (pendingNft) {
      pendingNft.nftId = nftId;
      pendingNft.spendingAmount = new BigNumber(1);
      pendingNft.assetName = `NFT ${nftId}`;
      // Currently offered NFT is not locked upon creating offer so status should be 'alsoUsedInNewOfferWithoutConflict'.
      pendingNft.status = 'alsoUsedInNewOfferWithoutConflict';
    }
  });

  await Promise.all([...ballTasks, ...tokenTasks, ...nftTasks]);

  // requested
  requestedBall.forEach((ball) => {
    const { amount } = ball;

    // For one-sided offers where nothing is requested, we allow the amount to be '0'
    // and skip adding an entry to the walletIdsAndAmounts object.
    //
    // If the amount is blank '', we prompt the user to enter an amount.
    if (amount === '0') {
      return;
    }

    if (!amount) {
      throw new Error(t`Please enter an BALL amount`);
    }

    const wallet = wallets.find((w) => w.type === WalletType.STANDARD_WALLET);
    if (!wallet) {
      throw new Error(t`No standard wallet found`);
    }

    if (wallet.id in walletIdsAndAmounts) {
      throw new Error(t`Cannot offer and request the same asset`);
    }

    walletIdsAndAmounts[wallet.id] = ballToMojo(amount);
  });

  requestedTokens.forEach((token) => {
    const { assetId, amount } = token;

    if (!assetId) {
      throw new Error(t`Please select an asset for each token`);
    }

    if (!allowUnknownRequestedCATs) {
      const wallet = findCATWalletByAssetId(wallets, assetId);
      if (!wallet) {
        throw new Error(t`No CAT wallet found for ${assetId} token`);
      }

      if (!amount || amount === '0') {
        throw new Error(t`Please enter an amount for ${wallet.meta?.name} token`);
      }

      walletIdsAndAmounts[wallet.id] = catToMojo(amount);
    }
  });

  const prepareNftTasks = requestedNfts.map(async ({ nftId }) => {
    if (usedNFTs.includes(nftId)) {
      throw new Error(t`NFT ${nftId} is already used in this offer`);
    }
    usedNFTs.push(nftId);

    const { id, amount, driver } = await prepareNFTOfferFromNFTId(nftId, false);

    walletIdsAndAmounts[id] = amount;
    if (driver) {
      driverDict[id] = driver;

      if (considerNftRoyalty && pendingBallOffer) {
        const royaltyPercentageStr = driver.also.also?.transfer_program.royalty_percentage;
        if (royaltyPercentageStr) {
          const royaltyMultiplier = 1 + +royaltyPercentageStr / 10_000;
          const spendingBall = pendingBallOffer.spendingAmount.minus(feeInMojos);
          const newSpendingBall = spendingBall.multipliedBy(royaltyMultiplier).plus(feeInMojos);
          pendingBallOffer.spendingAmount = newSpendingBall;

          const hasEnoughSpendableBalance = pendingBallOffer.spendableAmount.gte(pendingBallOffer.spendingAmount);
          if (!hasEnoughSpendableBalance) {
            pendingBallOffer.status = 'conflictsWithNewOffer';
          } else {
            pendingBallOffer.status = 'alsoUsedInNewOfferWithoutConflict';
          }
        }
      }
    }
  });

  await Promise.all(prepareNftTasks);

  return {
    walletIdsAndAmounts,
    driverDict,
    feeInMojos,
    validateOnly,
    assetsToUnlock: pendingOffers.filter((po) => po.spendingAmount.gt(0)),
  };
}
