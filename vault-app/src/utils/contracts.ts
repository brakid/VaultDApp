import { BigNumber, ethers } from 'ethers';
import { VaultTokenContract } from './types';
import vaultTokenAbi from './VaultToken.json';

const VAULT_TOKEN_ADDRESS = '0xd9fDD544c7db7a69D87755Cc702dEe49e44c4857';
const TOKEN_IDS = [1, 2, 3, 4, 5].map(id => BigNumber.from(id));

export const getVaultTokenContract = (signer: ethers.Signer): VaultTokenContract => {
  return {
    contract: new ethers.Contract(VAULT_TOKEN_ADDRESS, vaultTokenAbi, signer),
    tokenIds: TOKEN_IDS,
  };
};

