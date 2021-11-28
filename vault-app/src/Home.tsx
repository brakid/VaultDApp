import { useContext, useEffect, useState } from 'react';
import { EthereumContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { BigNumber, ethers } from 'ethers';
import { getVaultTokenContract } from './utils/contracts';

const Home = () => {
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const [vaultTokenContract, setVaultTokenContract] = useState<VaultTokenContract>();
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    const init = async () => {
      if (ethereumContext.web3Provider) {
        setBalance(await ethereumContext.web3Provider.getSigner().getBalance());
        setAddress(await ethereumContext.web3Provider.getSigner().getAddress());
        setVaultTokenContract(getVaultTokenContract(ethereumContext.web3Provider.getSigner()));
      }
    };

    init();
  }, [ethereumContext]);

  return (
    <div>
      <p>Balance { ethers.utils.formatEther(balance) } MATIC</p>
      <p>Address: { address }</p>
      <ul>
        { vaultTokenContract?.tokenIds.map((id, index) => {
          return (
            <p key={ index }><a href={ '/vault/' + id.toString() }>Vault { id.toString() }</a></p>
          );
        }) }
      </ul>
    </div> 
  );
}

export default Home;