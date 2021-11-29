import { BigNumber, ethers } from 'ethers';

export interface Ethereum {
  web3Provider?: ethers.providers.Web3Provider;
  blockNumber: number;
};

export interface VaultTokenContract {
  contract: ethers.Contract,
  tokenIds: BigNumber[],
};

export interface EthereumChain {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export interface RpcError {
  code: number,
  message: string,
};