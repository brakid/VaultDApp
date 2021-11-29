import { EthereumChain } from './types';

export const EXPECTED_NETWORK = 'maticmum';

export const POLYGON_TESTNET: EthereumChain = {
  chainId: '0x13881',
  chainName: 'Polygon Testnet',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
}