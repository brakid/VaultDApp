import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EthereumContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { getVaultTokenContract } from './utils/contracts';
import { BigNumber } from 'ethers';

const Vault = () => {
  const { id } = useParams<string>();
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const [_, setVaultTokenContract] = useState<VaultTokenContract>();
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
      <h1 className='text-center text-xl'>Vault { id }</h1>
      { isOwner && <p className='shadow py-4 px-4 my-4 bg-green-100 text-green-700 border-black border-2'>You are the owner - open</p> }
      { !!!isOwner && <p className='shadow py-4 px-4 my-4 bg-yellow-100 text-yellow-700 border-black border-2'>You are not the owner - closed</p> }
    </div>
  );
}

export default Vault;