import Wallet from '../services/WalletService';

export default class StakingWallet extends Wallet {
  async stakingInfo(fingerprint: number) {
    return this.command('staking_info', {
      fingerprint,
    });
  }

  async stakingSend(amount: string, fingerprint: number) {
    return this.command('staking_send', {amount, fingerprint});
  }

  async stakingWithdraw(amount: string, fingerprint: number) {
    return this.command('staking_withdraw', {amount, fingerprint});
  }

  async findPoolNFT(launcherId: string, contractAddress: string) {
    return this.command('find_pool_nft', {launcherId, contractAddress});
  }

  async recoverPoolNFT(launcherId: string, contractAddress: string) {
      return this.command('recover_pool_nft', {launcherId, contractAddress});
  }
}
