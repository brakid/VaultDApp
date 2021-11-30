import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EthereumContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { getVaultTokenContract } from './utils/contracts';
import { BigNumber, utils } from 'ethers';

interface Authentication {
  id: number,
  address: string,
  signature: string,
  timestamp: number,
};

const Vault = () => {
  const { id } = useParams<string>();
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const [_, setVaultTokenContract] = useState<VaultTokenContract>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [vaultData, setVaultData] = useState<string>('');
  const [vaultOpen, setVaultOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const init = async () => {
      if (ethereumContext.web3Provider) {
        const vaultTokenContract = getVaultTokenContract(ethereumContext.web3Provider.getSigner());
        setVaultTokenContract(vaultTokenContract);

        const address = await ethereumContext.web3Provider.getSigner().getAddress();
        const owner = await vaultTokenContract.contract.ownerOf(BigNumber.from(id));
        const isOwner = owner === address
        setIsOwner(isOwner);
      }
    };

    init();
  }, [ethereumContext, id]);

  const signMessage = async (): Promise<Authentication> => {
    if (ethereumContext.web3Provider && id) {
      const idNumber = parseInt(id);
      const timestamp = Math.floor(Date.now() / 1000);
      const address = await ethereumContext.web3Provider.getSigner().getAddress();
      const hash = utils.solidityKeccak256(['address', 'uint256', 'uint256'], [address, timestamp, idNumber]);
      const signature = await ethereumContext.web3Provider.getSigner().signMessage(hash);

      return Promise.resolve({ address, timestamp, id: idNumber, signature });
    }
    return Promise.reject('No context found');
  };

  const readVault = async () => {
    try {
      const authentication = await signMessage();
      const response = await fetch('http://localhost:8080/read/vault/' + id, {
        method: 'POST',
        body: JSON.stringify(authentication)
      });

      if (response.status === 403) {
        setError('No access: you are not the owner of this vault');
        return;
      }
      
      const data = await response.json();

      setVaultData(data);
      setVaultOpen(true);
      setError('');
    } catch(err) {
      setError(JSON.stringify(err));
    }
  };

  const writeVault = async () => {
    try {
      const authentication = await signMessage();
      const response = await fetch('http://localhost:8080/write/vault/' + id, {
        method: 'POST',
        body: JSON.stringify({
          ...authentication, content: vaultData
        })
      });

      if (response.status === 403) {
        setError('No access: you are not the owner of this vault');
        return;
      }
      
      const data = await response.json();

      setVaultData(data);
      setVaultOpen(true);
      setError('');
    } catch(err) {
      setError(JSON.stringify(err));
    }
  };

  return (
    <div>
      <h1 className='text-center text-xl'>Vault { id }</h1>
      { isOwner && 
        <div className='flex flex-col gap-y-4'>
          { error.length > 0 && 
            <p className='py-4 px-4 my-4 bg-red-100 text-red-700  border-black border-2'>Error: { error }</p>
          }
          { error.length === 0 && <>
            <p className='py-4 px-4 my-4 bg-green-100 text-green-700 border-black border-2'>You are the owner - vault open</p>
            { !!!vaultOpen && 
              <button className='bg-yellow-300 hover:bg-yellow-400 text-black py-2 px-4 border-black border-2' onClick={ () => readVault() }>Read vault content</button>
            }
            { vaultOpen && <>
              <textarea className='p-2 border-black border-2' onChange={ (e) => setVaultData(e.target.value) } value={ vaultData } />
              <button className='bg-yellow-300 hover:bg-yellow-400 text-black py-2 px-4 border-black border-2' onClick={ () => writeVault() }>Save vault content</button>
            </>}
          </>}
        </div>
      }
      { !!!isOwner && <p className='py-4 px-4 my-4 bg-yellow-100 text-yellow-700 border-black border-2'>You are not the owner - vault closed</p> }
    </div>
  );
}

export default Vault;
