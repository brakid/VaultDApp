import { BigNumber, ethers } from "ethers";

export interface Ethereum {
  web3Provider?: ethers.providers.Web3Provider;
  blockNumber: number;
};

export interface VaultTokenContract {
  contract: ethers.Contract,
  tokenIds: BigNumber[],
};