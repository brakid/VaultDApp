import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EthereumContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { getVaultTokenContract } from './utils/contracts';
import { BigNumber } from 'ethers';

const Vault = () => {
  const { id } = useParams<string>();
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const [vaultTokenContract, setVaultTokenContract] = useState<VaultTokenContract>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  
  useEffect(() => {
    const init = async () => {
      if (ethereumContext.web3Provider) {
        const vaultTokenContract = getVaultTokenContract(ethereumContext.web3Provider.getSigner());
        setVaultTokenContract(vaultTokenContract);

        const address = await ethereumContext.web3Provider.getSigner().getAddress();
        const owner = await vaultTokenContract.contract.ownerOf(BigNumber.from(id));
        setIsOwner(owner === address);
      }
    };

    init();
  }, [ethereumContext, id]);

  return (
    <div>
      <p>Vault { JSON.stringify(id) }</p>
      { isOwner && <p>You are the owner - open</p> }
    </div>
  );
}

export default Vault;