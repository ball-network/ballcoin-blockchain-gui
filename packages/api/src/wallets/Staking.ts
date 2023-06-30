import Wallet from '../services/WalletService';
import BigNumber from "bignumber.js";
import Transaction from "../@types/Transaction";
import NFTRecoverInfo from "../@types/NFTRecoverInfo";

export default class StakingWallet extends Wallet {
  async stakingInfo(fingerprint: number) {
    return this.command('staking_info', {
      fingerprint,
    });
  }

  async stakingSend(args: {
    amount: BigNumber;
    fingerprint: number;
  }) {
    return this.command<{ transaction: Transaction; transactionId: string }>('staking_send', args);
  }
  async stakingWithdraw(args: {
    amount: BigNumber;
    fingerprint: number;
  }) {
    return this.command<{ transaction: Transaction; transactionId: string }>('staking_withdraw', args);
  }

  async findPoolNFT(launcherId: string, contractAddress: string) {
    return this.command<NFTRecoverInfo>('find_pool_nft', {launcherId, contractAddress});
  }

  async recoverPoolNFT(launcherId: string, contractAddress: string) {
      return this.command('recover_pool_nft', {launcherId, contractAddress});
  }
}
