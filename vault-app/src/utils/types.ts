import { ethers } from "ethers";

export interface Ethereum {
  web3Provider?: ethers.providers.Web3Provider;
  blockNumber: number;
};