import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EthereumContext, Firebase, FirebaseContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { getVaultTokenContract } from './utils/contracts';
import { BigNumber } from 'ethers';
import { collection, query, getDocs, where, updateDoc } from 'firebase/firestore/lite';

const Vault = () => {
  const { id } = useParams<string>();
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const { firestore } = useContext<Firebase>(FirebaseContext);
  const [_, setVaultTokenContract] = useState<VaultTokenContract>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [vaultData, setVaultData] = useState<string>('');
  
  useEffect(() => {
    const init = async () => {
      if (ethereumContext.web3Provider) {
        const vaultTokenContract = getVaultTokenContract(ethereumContext.web3Provider.getSigner());
        setVaultTokenContract(vaultTokenContract);

        const address = await ethereumContext.web3Provider.getSigner().getAddress();
        const owner = await vaultTokenContract.contract.ownerOf(BigNumber.from(id));
        const isOwner = owner === address
        setIsOwner(isOwner);

        if (isOwner) {
          const vault = collection(firestore, 'vaultdata');
          const vaultQuery = query(vault, where('vault', '==', id));
          const vaultContent = await getDocs(vaultQuery);
          if (!!!vaultContent.empty) {
            setVaultData(vaultContent.docs[0].data().data);
          }
        }
      }
    };

    init();
  }, [ethereumContext, id, firestore]);

  const updateVaultData = async () => {
    if (isOwner) {
      const vault = collection(firestore, 'vaultdata');
      const vaultQuery = query(vault, where('vault', '==', id));
      const vaultContent = await getDocs(vaultQuery);
      if (!!!vaultContent.empty) {
        const ref = vaultContent.docs[0].ref;
        const data = vaultContent.docs[0].data();
        const newData = Object.assign({}, data, { data: vaultData });
        await updateDoc(ref, newData);
      }
    }
  }

  return (
    <div>
      <h1 className='text-center text-xl'>Vault { id }</h1>
      { isOwner && 
        <div className='flex flex-col gap-y-4'>
          <p className='shadow py-4 px-4 my-4 bg-green-100 text-green-700 border-black border-2'>You are the owner - vault open</p>
          <textarea className='p-2 border-black border-2' onChange={ (e) => setVaultData(e.target.value) } value={ vaultData } ></textarea>
          <button className='bg-yellow-300 hover:bg-yellow-400 text-black py-2 px-4 border-black border-2' onClick={ () => updateVaultData() }>Save content</button>
        </div>
      }
      { !!!isOwner && <p className='shadow py-4 px-4 my-4 bg-yellow-100 text-yellow-700 border-black border-2'>You are not the owner - vault closed</p> }
    </div>
  );
}

export default Vault;
